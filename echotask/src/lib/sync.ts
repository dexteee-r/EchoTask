import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import { getLocalDirtyTasks, markTaskAsSynced, bulkUpsertTasks } from '../db';

export function useSync(refreshLocalView: () => void) {
  const { user, mode } = useAuth(); // mode vient maintenant d'AuthContext
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (mode !== 'cloud' || !user) return;

    let syncInterval: ReturnType<typeof setInterval>;

    const performSync = async () => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
        // 1. PUSH : Envoyer les tâches locales dirty vers Supabase
        const dirtyTasks = await getLocalDirtyTasks();
        if (dirtyTasks.length > 0) {
          const tasksToPush = dirtyTasks.map(t => ({
            id: t.id,
            user_id: user.id,
            raw_text: t.rawText,
            clean_text: t.cleanText || null,
            status: t.status,
            tags: t.tags || [],
            due: t.due || null,
            subtasks: t.subtasks || [],
            file_path: t.filePath || null,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
            deleted: t.deleted || false,
          }));

          const { error } = await supabase.from('tasks').upsert(tasksToPush);
          if (!error) {
            for (const t of dirtyTasks) {
              await markTaskAsSynced(t.id);
            }
          }
        }

        // 2. PULL : Récupérer les tâches modifiées depuis le serveur
        // Pour simplifier l'offline-first, on récupère toutes les tâches de l'utilisateur
        // (En production sur une grosse base, on utiliserait une date lastSync)
        const { data: serverTasks, error: pullError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (!pullError && serverTasks) {
          const tasksToUpsert: Task[] = serverTasks.map(row => ({
            id: row.id,
            rawText: row.raw_text,
            cleanText: row.clean_text,
            status: row.status as any,
            tags: row.tags,
            due: row.due,
            subtasks: row.subtasks,
            filePath: row.file_path,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deleted: row.deleted,
            isDirty: false
          }));
          await bulkUpsertTasks(tasksToUpsert);
          refreshLocalView();
        }
      } catch (err) {
        console.error("Erreur de synchronisation", err);
      } finally {
        setIsSyncing(false);
      }
    };

    // Lancer une sync initiale
    performSync();

    // S'abonner aux changements temps réel de Supabase
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Si on reçoit un événement, on déclenche un pull/push
          await performSync();
        }
      )
      .subscribe();

    // Sync périodique au cas où le realtime rate un event (fallback)
    syncInterval = setInterval(performSync, 60000); // toutes les minutes

    return () => {
      supabase.removeChannel(channel);
      clearInterval(syncInterval);
    };
  }, [user, mode]);

  return { isSyncing };
}

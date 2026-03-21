import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSTT } from '../useSTT';
import * as sttModule from '../../stt';

// Mock du module stt
vi.mock('../../stt', () => ({
  sttSupported: vi.fn(),
  startLocalSTT: vi.fn(),
  recordAndTranscribeCloud: vi.fn(),
}));

describe('useSTT hook', () => {
  const onTranscript = vi.fn();
  const onSttError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect if STT is supported', () => {
    (sttModule.sttSupported as any).mockReturnValue(true);
    const { result } = renderHook(() => useSTT(onTranscript));
    expect(result.current.isSupported).toBe(true);
  });

  it('should start and stop local STT', () => {
    (sttModule.sttSupported as any).mockReturnValue(true);
    const stopMock = vi.fn();
    (sttModule.startLocalSTT as any).mockReturnValue(stopMock);

    const { result } = renderHook(() => useSTT(onTranscript));

    act(() => {
      result.current.startLocal();
    });

    expect(result.current.listeningLocal).toBe(true);
    expect(sttModule.startLocalSTT).toHaveBeenCalled();

    act(() => {
      result.current.stopLocal();
    });

    expect(stopMock).toHaveBeenCalled();
    expect(result.current.listeningLocal).toBe(false);
  });

  it('should handle local STT callback', () => {
    (sttModule.sttSupported as any).mockReturnValue(true);
    let capturedOnText: (text: string) => void = () => {};
    
    (sttModule.startLocalSTT as any).mockImplementation((onText: any) => {
      capturedOnText = onText;
      return vi.fn();
    });

    const { result } = renderHook(() => useSTT(onTranscript));

    act(() => {
      result.current.startLocal();
    });

    act(() => {
      capturedOnText('Hello from STT');
    });

    expect(onTranscript).toHaveBeenCalledWith('Hello from STT');
  });

  it('should start and stop cloud STT (Whisper)', async () => {
    const mockStop = vi.fn().mockResolvedValue('Whisper text');
    (sttModule.recordAndTranscribeCloud as any).mockResolvedValue({
      stop: mockStop
    });

    const { result } = renderHook(() => useSTT(onTranscript, 'fr-FR', 'fr', 'api-key'));

    await act(async () => {
      await result.current.startCloud();
    });

    expect(result.current.listeningCloud).toBe(true);
    expect(sttModule.recordAndTranscribeCloud).toHaveBeenCalledWith('api-key', 'fr');

    await act(async () => {
      await result.current.stopCloud();
    });

    expect(mockStop).toHaveBeenCalled();
    expect(onTranscript).toHaveBeenCalledWith('Whisper text');
    expect(result.current.listeningCloud).toBe(false);
  });

  it('should throw error if cloud STT started without API key', async () => {
    const { result } = renderHook(() => useSTT(onTranscript));

    await expect(result.current.startCloud()).rejects.toThrow('Clé API requise pour STT cloud');
  });
});

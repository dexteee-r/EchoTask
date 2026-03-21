import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TaskStats from '../TaskStats';

describe('TaskStats Component', () => {
  const props = {
    active: 3,
    done: 2,
    activeLabel: 'actives',
    doneLabel: 'faites'
  };

  it('renders null when total tasks is 0', () => {
    const { container } = render(<TaskStats active={0} done={0} activeLabel="a" doneLabel="d" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with given stats', () => {
    render(<TaskStats {...props} />);
    
    // Check if labels and counts are present
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('actives')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('faites')).toBeInTheDocument();
    
    // Check if percentage is calculated correctly (2/5 = 40%)
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows 100% when all tasks are done', () => {
    render(<TaskStats active={0} done={5} activeLabel="a" doneLabel="d" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('calculates correct width for progress bar', () => {
    const { container } = render(<TaskStats active={1} done={3} activeLabel="a" doneLabel="d" />);
    // Total = 4, Done = 3 -> 75%
    const progressBar = container.querySelector('div[style*="width: 75%"]');
    expect(progressBar).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from '../EmptyState';

describe('EmptyState Component', () => {
  const props = {
    title: 'No tasks yet',
    microphoneHint: 'Click the mic to speak',
    keyboardHint: 'Type and press enter',
    improveHint: 'Click the magic wand to improve'
  };

  it('renders correctly with given props', () => {
    render(<EmptyState {...props} />);

    // Check if title is rendered
    expect(screen.getByText(props.title)).toBeInTheDocument();

    // Check if hints are rendered
    expect(screen.getByText(props.microphoneHint)).toBeInTheDocument();
    expect(screen.getByText(props.keyboardHint)).toBeInTheDocument();
    expect(screen.getByText(props.improveHint)).toBeInTheDocument();

    // Check if emojis are present
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('🎤')).toBeInTheDocument();
    expect(screen.getByText('⌨️')).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('applies correct classes', () => {
    const { container } = render(<EmptyState {...props} />);
    const mainDiv = container.firstChild as HTMLElement;
    
    expect(mainDiv).toHaveClass('fade-in-scale');
  });
});

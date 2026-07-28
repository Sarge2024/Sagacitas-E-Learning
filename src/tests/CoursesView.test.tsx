import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoursesView } from '../components/CoursesView';
import { Course } from '../types';
import React from 'react';

const mockCourse: Course = {
  id: '123',
  title: 'Test Course',
  category: 'Test',
  description: 'A test course',
  progress: 0,
  completedLessons: 0,
  totalLessons: 10,
  level: 'Iniciante',
  image: '', // Vazio, para testar a diretiva Zero Máscaras (deve cair no fallback)
  status: 'active',
  totalHours: '10h'
};

describe('CoursesView', () => {
  it('should render the fallback image when course image is empty', () => {
    const handleSelectCourse = vi.fn();
    const handleBack = vi.fn();

    render(
      <CoursesView 
        courses={[mockCourse]} 
        onSelectCourse={handleSelectCourse} 
        searchQuery=""
      />
    );

    // O curso deve estar renderizado
    expect(screen.getByText('Test Course')).toBeInTheDocument();

    // A imagem renderizada deve ser o fallback, já que o mock passou ''
    const imgElement = screen.getByAltText('Test Course') as HTMLImageElement;
    expect(imgElement.src).toContain('images.unsplash.com');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import DashboardView from './DashboardView.svelte';
import type { Survey } from '../types';

// Mock navigator.clipboard.writeText
global.navigator.clipboard = {
  writeText: vi.fn()
} as any;

// Mock window.location
global.window.location = {
  origin: 'http://localhost:3004',
  pathname: '/'
} as any;

describe('DashboardView', () => {
  const mockSurveys: Survey[] = [
    {
      id: 's_1',
      title: '员工满意度调查 2024',
      description: '收集员工对办公环境和福利的反馈',
      status: 'published',
      createdAt: '2024-03-15',
      responsesCount: 128,
      version: 1,
      theme: { primaryColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#1e293b', buttonTextColor: '#ffffff' },
      schema: { sections: [{ id: 'sec_1', title: '基本信息', fields: [{ id: 'f_1', type: 'input', label: '您的部门', required: true, logic: '' }] }] },
      publishedSchema: { sections: [{ id: 'sec_1', title: '基本信息', fields: [{ id: 'f_1', type: 'input', label: '您的部门', required: true, logic: '' }] }] }
    },
    {
      id: 's_2',
      title: '新产品用户调研',
      description: '针对 Beta 测试用户的深度访谈问卷',
      status: 'draft',
      createdAt: '2024-03-20',
      responsesCount: 0,
      version: 1,
      theme: { primaryColor: '#7c3aed', backgroundColor: '#fdf4ff', textColor: '#4c1d95', buttonTextColor: '#ffffff' },
      schema: { sections: [{ id: 'sec_1', title: '核心功能评价', fields: [] }] }
    }
  ];

  const mockOnCreateNew = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnViewStats = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnFill = vi.fn();

  const defaultProps = {
    surveys: mockSurveys,
    onCreateNew: mockOnCreateNew,
    onEdit: mockOnEdit,
    onViewStats: mockOnViewStats,
    onDelete: mockOnDelete,
    onFill: mockOnFill,
    primaryColor: '#2563eb',
    language: '简体中文',
    userPub: 'test-pub-key'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title and description', () => {
    render(DashboardView, defaultProps);
    expect(screen.getByText('问卷管理')).toBeInTheDocument();
    expect(screen.getByText('管理您的所有调查问卷和收集到的反馈')).toBeInTheDocument();
  });

  it('should render create new button', () => {
    render(DashboardView, defaultProps);
    expect(screen.getByText('创建新问卷')).toBeInTheDocument();
  });

  it('should call onCreateNew when create new button is clicked', async () => {
    render(DashboardView, defaultProps);
    const createButton = screen.getByText('创建新问卷');
    await fireEvent.click(createButton);
    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it('should render all surveys', () => {
    render(DashboardView, defaultProps);
    expect(screen.getByText('员工满意度调查 2024')).toBeInTheDocument();
    expect(screen.getByText('新产品用户调研')).toBeInTheDocument();
  });

  it('should display survey status correctly', () => {
    render(DashboardView, defaultProps);
    expect(screen.getByText('已发布')).toBeInTheDocument();
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('should display survey responses count and createdAt', () => {
    render(DashboardView, defaultProps);
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('2024-03-15')).toBeInTheDocument();
    expect(screen.getByText('2024-03-20')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    render(DashboardView, defaultProps);
    const editButtons = screen.getAllByText('编辑问卷');
    await fireEvent.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith('s_1');
  });

  it('should call onViewStats when stats button is clicked', async () => {
    render(DashboardView, defaultProps);
    const statsButtons = screen.getAllByRole('button', { name: /统计/ });
    await fireEvent.click(statsButtons[0]);
    expect(mockOnViewStats).toHaveBeenCalledWith('s_1');
  });

  it('should call onDelete when delete button is clicked', async () => {
    render(DashboardView, defaultProps);
    const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
    await fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith('s_1');
  });

  it('should call onFill when fill button is clicked', async () => {
    render(DashboardView, defaultProps);
    const fillButtons = screen.getAllByTitle('填写问卷');
    await fireEvent.click(fillButtons[0]);
    expect(mockOnFill).toHaveBeenCalledWith('s_1');
  });

  it('should copy share link when share button is clicked', async () => {
    render(DashboardView, defaultProps);
    const shareButtons = screen.getAllByRole('button', { name: /分享/ });
    await fireEvent.click(shareButtons[0]);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:3004/?pub=test-pub-key&id=s_1'
      );
    });
  });

  it('should show check icon after copying share link', async () => {
    render(DashboardView, defaultProps);
    const shareButtons = screen.getAllByRole('button', { name: /分享/ });
    await fireEvent.click(shareButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByRole('img', { name: /成功/ })).toBeInTheDocument();
    });
  });

  it('should not show fill button for draft surveys', () => {
    render(DashboardView, defaultProps);
    const fillButtons = screen.getAllByTitle('填写问卷');
    // Only published surveys should have fill button
    expect(fillButtons.length).toBe(1);
  });
});

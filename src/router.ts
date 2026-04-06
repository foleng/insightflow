import page from 'page';
import type { ViewType } from './types';

// 定义路由类型
export interface Route {
  path: string;
  view: ViewType;
  protected: boolean;
}

// 定义路由配置
export const routes: Route[] = [
  { path: '/', view: 'dashboard', protected: true },
  { path: '/ai', view: 'ai', protected: true },
  { path: '/editor/:id', view: 'editor', protected: true },
  { path: '/analytics/:id', view: 'analytics', protected: true },
  { path: '/fill/:id', view: 'fill', protected: false },
  { path: '/settings', view: 'settings', protected: true },
  { path: '/login', view: 'login', protected: false },
];

// 获取认证状态的函数类型
export type GetIsAuthenticated = () => boolean;

// 路由初始化函数
export function initRouter(
  setView: (view: ViewType) => void,
  setActiveSurveyId: (id: string | null) => void,
  getIsAuthenticated: GetIsAuthenticated,
  loginRedirect: () => void
) {
  if (typeof window === 'undefined') return;

  // 检查 URL 查询参数，处理分享链接
  const handleQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');
    
    if (surveyId && window.location.pathname !== '/fill') {
      // 如果有 id 参数且不是已经在 fill 页面，先清空查询参数再跳转
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      page.show(`/fill/${surveyId}`);
      return true;
    }
    return false;
  };

  // 注册路由
  routes.forEach(route => {
    page(route.path, (context) => {
      // 检查路由是否需要认证
      if (route.protected && !getIsAuthenticated()) {
        page.redirect('/login');
        return;
      }

      // 对于需要 surveyId 的路由，提取并设置
      if (route.path.includes(':id')) {
        setActiveSurveyId(context.params.id);
      } else {
        setActiveSurveyId(null);
      }

      // 设置当前视图
      setView(route.view);
    });
  });

  // 404 路由
  page('*', () => {
    if (getIsAuthenticated()) {
      page.redirect('/');
    } else {
      page.redirect('/login');
    }
  });

  // 启动路由
  page.start();
  
  // 路由启动后处理查询参数（延迟执行确保路由系统已初始化）
  setTimeout(() => {
    handleQueryParams();
  }, 0);
}

// 路由导航函数
export function navigateTo(path: string) {
  if (typeof window === 'undefined') return;
  page.show(path);
}

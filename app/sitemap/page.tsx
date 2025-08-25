import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: '网站地图 - Flask Auth System',
  description: '查看网站的所有页面和链接',
}

export default function SitemapPage() {
  const mainPages = [
    { name: '首页', path: '/', description: '网站主页' },
    { name: '登录', path: '/auth/login', description: '用户登录页面' },
    { name: '注册', path: '/auth/register', description: '用户注册页面' },
    { name: '仪表板', path: '/dashboard', description: '用户仪表板' },
    { name: '文章', path: '/articles', description: '文章列表页面' },
    { name: '管理后台', path: '/admin', description: '管理员后台' },
  ]

  const dashboardPages = [
    { name: '个人资料', path: '/dashboard/profile', description: '用户个人资料设置' },
    { name: '设置', path: '/dashboard/settings', description: '用户设置页面' },
    { name: '文章管理', path: '/dashboard/articles', description: '文章管理页面' },
    { name: '媒体管理', path: '/dashboard/media', description: '媒体文件管理' },
    { name: '上传媒体', path: '/dashboard/media/upload', description: '上传媒体文件' },
  ]

  const apiEndpoints = [
    { name: '用户API', path: '/api/auth/user', description: '用户相关API接口' },
    { name: '角色API', path: '/api/auth/roles', description: '角色管理API接口' },
    { name: '文章API', path: '/api/articles', description: '文章管理API接口' },
    { name: '分类API', path: '/api/categories', description: '分类管理API接口' },
    { name: '媒体API', path: '/api/media', description: '媒体文件API接口' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">网站地图</h1>
        <p className="text-lg text-muted-foreground">
          浏览网站的所有页面和功能
        </p>
      </div>

      <div className="space-y-8">
        {/* 主要页面 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              主要页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainPages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="block p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{page.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 仪表板页面 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              仪表板页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardPages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="block p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{page.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{page.path}</code>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* API接口 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔌</span>
              API接口
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiEndpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <h3 className="font-semibold text-lg mb-2">{endpoint.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                  <code className="text-xs bg-background px-2 py-1 rounded border">{endpoint.path}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* 其他重要链接 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              其他重要链接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/rss"
                className="block p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">RSS订阅</h3>
                <p className="text-sm text-muted-foreground mb-2">获取网站最新内容的RSS源</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">/rss</code>
              </Link>
              <Link
                href="/robots.txt"
                className="block p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">Robots.txt</h3>
                <p className="text-sm text-muted-foreground mb-2">搜索引擎爬虫指南</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">/robots.txt</code>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>最后更新: {new Date().toLocaleDateString('zh-CN')}</p>
        <p>如需更新网站地图，请联系管理员</p>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, ClockIcon, UserIcon, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

interface Activity {
  id: number
  user_id: string
  username: string
  user_avatar: string
  activity_type_code: string
  activity_type_name: string
  activity_type_icon: string
  activity_type_color: string
  entity_type: string
  entity_id: string
  title: string
  description: string
  metadata: any
  status: string
  created_at: string
}

interface ActivityStats {
  total: number
  articles: number
  media: number
  users: number
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<ActivityStats>({ total: 0, articles: 0, media: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/activities?limit=50')
      if (!response.ok) {
        throw new Error('获取活动记录失败')
      }
      
      const data = await response.json()
      setActivities(data.activities || [])
      
      // 计算统计信息
      const total = data.activities?.length || 0
      const articles = data.activities?.filter((a: Activity) => a.entity_type === 'article').length || 0
      const media = data.activities?.filter((a: Activity) => a.entity_type === 'media').length || 0
      const users = data.activities?.filter((a: Activity) => a.entity_type === 'user').length || 0
      
      setStats({ total, articles, media, users })
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchActivities()
    }
  }, [user])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "刚刚"
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'pending':
        return '进行中'
      case 'failed':
        return '失败'
      default:
        return status
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            请先登录
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            您需要登录后才能查看活动记录
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            活动记录
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            查看系统中的所有活动记录和操作历史
          </p>
        </div>
        <Button 
          onClick={fetchActivities} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总活动数</CardTitle>
            <CalendarIcon className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              本月活动记录
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文章操作</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articles}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              创建和更新
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">媒体操作</CardTitle>
            <span className="text-2xl">📁</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.media}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              上传和删除
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户操作</CardTitle>
            <UserIcon className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              注册和登录
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 活动列表 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>
            显示系统中最近的操作记录和活动
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                暂无活动记录
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user_avatar || "/placeholder-user.jpg"} alt={activity.username} />
                      <AvatarFallback>
                        {activity.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{activity.activity_type_icon}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {activity.title}
                      </span>
                      <Badge className={activity.activity_type_color}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-3 w-3" />
                        <span>{activity.username || '未知用户'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatTimestamp(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

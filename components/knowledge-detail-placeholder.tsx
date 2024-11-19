import { Card, CardContent, CardDescription } from '@/components/ui/card'

export default function KnowledgeDetailPlaceholder() {
  return (
    <Card className="w-full">
      <CardContent>
        <CardDescription className="text-foreground/30 text-sm text-center py-4">
          选择或导入文件
        </CardDescription>
      </CardContent>
    </Card>
  )
}

// 问题汇总：
// 1. List 不能自动填充左上的剩余区域
// 2. 整体宽度无法用 max-w 控制，80似乎是一个临界值
// 3. 切换Item时如何更新右侧的内容？在parent element中围护一个state；在URL中传递参数（`usePathname()`产生的冲突）

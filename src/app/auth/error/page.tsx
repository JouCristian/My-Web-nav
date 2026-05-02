// 🚀 自定义 NextAuth 错误页：替代默认会 500 崩掉的 /api/auth/error
// 通过 URL query param 把 NextAuth 抛出的真实错误码展示出来，方便排查
import Link from "next/link"

const ERROR_DESCRIPTIONS: Record<string, { title: string; hint: string }> = {
  Configuration: {
    title: "服务端配置错误",
    hint: "OAuth Provider 的 clientId / clientSecret 与 Gitee 控制台不匹配，或环境变量未生效。请在 Gitee 应用控制台重置 Client Secret，并确认已写入 GITEE_CLIENT_ID / GITEE_CLIENT_SECRET 两个环境变量。",
  },
  AccessDenied: {
    title: "访问被拒绝",
    hint: "用户拒绝授权，或 signIn callback 返回了 false。",
  },
  Verification: {
    title: "验证链接已失效",
    hint: "邮箱魔法链接超时或已被使用。",
  },
  OAuthSignin: {
    title: "无法构建 OAuth 授权 URL",
    hint: "Provider 的 authorization endpoint 配置异常，或 clientId 缺失。",
  },
  OAuthCallback: {
    title: "OAuth 回调处理失败",
    hint: "通常是 Gitee 返回的 token 交换响应异常（401 / invalid_client / invalid_grant）。最常见原因：Client Secret 不对，或者 Gitee 控制台填的回调 URL 与当前域名不一致。",
  },
  OAuthCreateAccount: {
    title: "创建用户账户失败",
    hint: "Prisma Adapter 写库报错，可能是 schema 不匹配或 DATABASE_URL 异常。",
  },
  EmailCreateAccount: {
    title: "邮箱账户创建失败",
    hint: "数据库写入失败。",
  },
  Callback: {
    title: "Callback 异常",
    hint: "session / signIn callback 抛错。",
  },
  OAuthAccountNotLinked: {
    title: "账号未关联",
    hint: "该邮箱已经被另一个登录方式注册过。请用最初注册时使用的方式登录。",
  },
  EmailSignin: {
    title: "邮件发送失败",
    hint: "无法发送魔法链接邮件。",
  },
  CredentialsSignin: {
    title: "账号或密码错误",
    hint: "Credentials provider 验证未通过。",
  },
  SessionRequired: {
    title: "需要登录",
    hint: "访问受保护页面前请先登录。",
  },
  Default: {
    title: "未知错误",
    hint: "未匹配到具体错误码，请查看 Vercel Runtime Logs 获取栈追踪。",
  },
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const code = params.error ?? "Default"
  const detail = ERROR_DESCRIPTIONS[code] ?? ERROR_DESCRIPTIONS.Default

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020205] px-4">
      <div className="max-w-lg w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-red-400/80 font-mono">Auth Error</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{detail.title}</h1>
          <p className="mt-1 text-sm text-white/50 font-mono">code: {code}</p>
        </div>

        <p className="text-sm leading-relaxed text-white/70">{detail.hint}</p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
          >
            返回登录
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-white/15 text-white/80 px-4 py-2 text-sm hover:bg-white/5 transition"
          >
            回首页
          </Link>
        </div>
      </div>
    </main>
  )
}

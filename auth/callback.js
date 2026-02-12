import { createServerClient } from '@supabase/ssr'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`)
  const code = url.searchParams.get('code')

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies?.[name]
        },
        set(name, value, options) {
          res.setHeader('Set-Cookie', serialize(name, value, options))
        },
        remove(name, options) {
          res.setHeader('Set-Cookie', serialize(name, '', { ...options, maxAge: 0 }))
        }
      }
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  res.writeHead(302, { Location: '/' })
  res.end()
}
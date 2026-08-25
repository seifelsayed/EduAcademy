import { z } from 'zod'

import type { AuthRepository } from '@/core/domain/repositories'
import { authPayloadSchema, userSchema } from '@/core/domain/schemas/user'
import { http } from '@/core/infrastructure/http/httpClient'
import { tokenStorage } from '@/core/infrastructure/storage/tokenStorage'

export const authApi: AuthRepository = {
  async register(input) {
    const payload = await http.post('/auth/register', input, authPayloadSchema)
    tokenStorage.set(payload.token)

    return payload
  },

  async login(input) {
    const payload = await http.post('/auth/login', input, authPayloadSchema)
    tokenStorage.set(payload.token)

    return payload
  },

  async logout(allDevices = false) {
    try {
      await http.command('post', '/auth/logout', { all_devices: allDevices })
    } finally {
      // The local session must end even if the revoke call fails.
      tokenStorage.clear()
    }
  },

  me() {
    return http.get('/auth/me', userSchema)
  },

  updateProfile(input, avatar) {
    // An avatar forces multipart, and PHP does not parse multipart on PATCH —
    // hence the method override.
    if (avatar) {
      const form = new FormData()
      form.append('_method', 'PATCH')
      form.append('avatar', avatar)

      for (const [key, value] of Object.entries(input)) {
        if (value !== undefined && value !== null) {
          form.append(key, String(value))
        }
      }

      return http.upload('/profile', form, userSchema)
    }

    return http.patch('/profile', input, userSchema)
  },

  async changePassword(input) {
    await http.post('/profile/password', input, z.null())
  },
}

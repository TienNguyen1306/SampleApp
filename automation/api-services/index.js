/**
 * ShopVN API Service
 *
 * Re-exports all service modules for convenient single-import usage:
 *
 *   import { auth, product, order, cart, user, profile, health } from './api-service/index.js'
 *
 *   const { token } = await auth.login('admin', 'password123')
 *   const products  = await product.getProducts(token)
 */

export * as auth    from './auth.service.js'
export * as product from './product.service.js'
export * as order   from './order.service.js'
export * as cart    from './cart.service.js'
export * as user    from './user.service.js'
export * as profile from './profile.service.js'
export * as health  from './health.service.js'

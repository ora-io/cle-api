export type DSPHookKeys = 'getBlock' | 'getReceipts'
export type DSPHooks = Record<DSPHookKeys, (...args: any[]) => any>

/**
 * modify hooks
 * dspHooks.getBlock = () => {
 *    // do something
 * }
 */
export const dspHooks: DSPHooks = {
  getBlock: () => {
    throw new Error('Function not implemented.')
  },
  getReceipts: () => {
    throw new Error('Function not implemented.')
  },
}

// Pointer, can also modify this by modify dspHooks.getBlock
export const getBlock = dspHooks.getBlock

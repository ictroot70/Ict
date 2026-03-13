import fs from 'node:fs'
import path from 'node:path'

const CONTRACT_PATH = '.ai/contracts/product-requirements-lock.json'
const ALLOWED_GROUP_STATUS = new Set(['locked', 'optional_or_blocked', 'planned'])
const ALLOWED_ITEM_STATUS = new Set(['locked', 'optional_or_blocked', 'planned'])

const rootDir = process.cwd()
const contractFullPath = path.join(rootDir, CONTRACT_PATH)

function readContract() {
  if (!fs.existsSync(contractFullPath)) {
    throw new Error(`Contract file is missing: ${CONTRACT_PATH}`)
  }

  try {
    const raw = fs.readFileSync(contractFullPath, 'utf8')

    return JSON.parse(raw)
  } catch (error) {
    throw new Error(
      `Failed to parse contract JSON: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

function ensureFileExists(relativePath, errors, context) {
  const fullPath = path.join(rootDir, relativePath)

  if (!fs.existsSync(fullPath)) {
    errors.push(`[${context}] Missing file: ${relativePath}`)
  }
}

function validateContract(contract) {
  const errors = []
  const warnings = []
  const seenGroupIds = new Set()
  const seenItemIds = new Set()

  if (!contract || typeof contract !== 'object') {
    errors.push('Contract must be an object')

    return { errors, warnings, summary: null }
  }

  if (typeof contract.contractVersion !== 'string' || contract.contractVersion.length === 0) {
    errors.push('contractVersion is required and must be a non-empty string')
  }

  if (typeof contract.updatedAt !== 'string' || contract.updatedAt.length === 0) {
    errors.push('updatedAt is required and must be a non-empty string')
  }

  if (!Array.isArray(contract.groups) || contract.groups.length === 0) {
    errors.push('groups must be a non-empty array')
  }

  const summary = {
    groups: 0,
    items: 0,
    lockedItems: 0,
    optionalOrBlockedItems: 0,
    plannedItems: 0,
  }

  for (const group of contract.groups || []) {
    summary.groups += 1

    if (!group || typeof group !== 'object') {
      errors.push('Each group must be an object')
      continue
    }

    if (!group.id || typeof group.id !== 'string') {
      errors.push('Each group requires a string id')
      continue
    }

    if (seenGroupIds.has(group.id)) {
      errors.push(`Duplicate group id: ${group.id}`)
    }
    seenGroupIds.add(group.id)

    if (!ALLOWED_GROUP_STATUS.has(group.status)) {
      errors.push(
        `Group "${group.id}" has invalid status "${group.status}". Allowed: ${Array.from(ALLOWED_GROUP_STATUS).join(', ')}`
      )
    }

    if (!Array.isArray(group.items) || group.items.length === 0) {
      errors.push(`Group "${group.id}" must have a non-empty items array`)
      continue
    }

    for (const item of group.items) {
      summary.items += 1

      if (!item || typeof item !== 'object') {
        errors.push(`Group "${group.id}" contains non-object item`)
        continue
      }

      if (!item.id || typeof item.id !== 'string') {
        errors.push(`Group "${group.id}" contains item without string id`)
        continue
      }

      if (seenItemIds.has(item.id)) {
        errors.push(`Duplicate item id: ${item.id}`)
      }
      seenItemIds.add(item.id)

      if (!ALLOWED_ITEM_STATUS.has(item.status)) {
        errors.push(
          `Item "${item.id}" has invalid status "${item.status}". Allowed: ${Array.from(ALLOWED_ITEM_STATUS).join(', ')}`
        )
      }

      if (!Array.isArray(item.sourceFiles) || item.sourceFiles.length === 0) {
        errors.push(`Item "${item.id}" must have non-empty sourceFiles`)
      } else {
        for (const sourceFile of item.sourceFiles) {
          ensureFileExists(sourceFile, errors, item.id)
        }
      }

      if (!Array.isArray(item.contractTests)) {
        errors.push(`Item "${item.id}" must have contractTests array`)
      } else {
        for (const testFile of item.contractTests) {
          ensureFileExists(testFile, errors, item.id)
        }
      }

      if (item.status === 'locked') {
        summary.lockedItems += 1

        if (!item.contractTests || item.contractTests.length === 0) {
          errors.push(`Locked item "${item.id}" must include at least one contract test`)
        }
      } else if (item.status === 'optional_or_blocked') {
        summary.optionalOrBlockedItems += 1
      } else if (item.status === 'planned') {
        summary.plannedItems += 1

        if (item.contractTests && item.contractTests.length > 0) {
          warnings.push(
            `Planned item "${item.id}" already has contract tests. Consider moving it to locked when done.`
          )
        }
      }
    }
  }

  return { errors, warnings, summary }
}

function main() {
  try {
    const contract = readContract()
    const { errors, warnings, summary } = validateContract(contract)

    if (errors.length > 0) {
      console.error('Product contract validation failed:')
      for (const error of errors) {
        console.error(`- ${error}`)
      }
      process.exit(1)
    }

    console.log('Product contract validation passed.')
    if (summary) {
      console.log(
        `Groups: ${summary.groups}, Items: ${summary.items}, Locked: ${summary.lockedItems}, Optional/Blocked: ${summary.optionalOrBlockedItems}, Planned: ${summary.plannedItems}`
      )
    }

    if (warnings.length > 0) {
      console.warn('Warnings:')
      for (const warning of warnings) {
        console.warn(`- ${warning}`)
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()

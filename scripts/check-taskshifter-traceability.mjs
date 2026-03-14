import fs from 'node:fs'
import path from 'node:path'

const PRODUCT_CONTRACT_PATH = '.ai/contracts/product-requirements-lock.json'
const TRACEABILITY_PATH = '.ai/contracts/taskshifter-traceability-lock.json'

const rootDir = process.cwd()
const productContractFullPath = path.join(rootDir, PRODUCT_CONTRACT_PATH)
const traceabilityFullPath = path.join(rootDir, TRACEABILITY_PATH)

function readJson(fullPath, relativePath) {
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing file: ${relativePath}`)
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  } catch (error) {
    throw new Error(
      `Failed to parse JSON (${relativePath}): ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

function ensureFileExists(relativePath, errors, context) {
  const fullPath = path.join(rootDir, relativePath)

  if (!fs.existsSync(fullPath)) {
    errors.push(`[${context}] Missing file: ${relativePath}`)
  }
}

function validateTraceability(productContract, traceability) {
  const errors = []
  const warnings = []

  if (!Array.isArray(productContract?.groups) || productContract.groups.length === 0) {
    errors.push(`Invalid product contract: ${PRODUCT_CONTRACT_PATH} has no groups`)

    return { errors, warnings, summary: null }
  }

  const groupIds = new Set()
  const itemIds = new Set()
  const itemToGroup = new Map()
  const itemStatusMap = new Map()

  for (const group of productContract.groups) {
    if (!group?.id) {
      continue
    }
    groupIds.add(group.id)

    for (const item of group.items || []) {
      if (!item?.id) {
        continue
      }
      itemIds.add(item.id)
      itemToGroup.set(item.id, group.id)
      itemStatusMap.set(item.id, item.status)
    }
  }

  if (!traceability || typeof traceability !== 'object') {
    errors.push('Traceability must be an object')

    return { errors, warnings, summary: null }
  }

  if (
    typeof traceability.traceabilityVersion !== 'string' ||
    traceability.traceabilityVersion.length === 0
  ) {
    errors.push('traceabilityVersion is required and must be a non-empty string')
  }

  if (typeof traceability.updatedAt !== 'string' || traceability.updatedAt.length === 0) {
    errors.push('updatedAt is required and must be a non-empty string')
  }

  if (!Array.isArray(traceability.sources) || traceability.sources.length === 0) {
    errors.push('sources must be a non-empty array')
  }

  if (!Array.isArray(traceability.mappings) || traceability.mappings.length === 0) {
    errors.push('mappings must be a non-empty array')
  }

  const sourceMap = new Map()
  const ucBySourceMap = new Map()
  const seenSourceIds = new Set()

  for (const source of traceability.sources || []) {
    if (!source || typeof source !== 'object' || typeof source.id !== 'string' || !source.id) {
      errors.push('Every source must have a non-empty string id')
      continue
    }
    if (seenSourceIds.has(source.id)) {
      errors.push(`Duplicate source id: ${source.id}`)
      continue
    }

    seenSourceIds.add(source.id)
    sourceMap.set(source.id, source)

    if (!Array.isArray(source.uc) || source.uc.length === 0) {
      errors.push(`[${source.id}] uc must be a non-empty array`)
      continue
    }

    const seenUcIds = new Set()
    const ucIds = new Set()

    for (const uc of source.uc) {
      if (!uc || typeof uc.id !== 'string' || !uc.id) {
        errors.push(`[${source.id}] every uc must have a non-empty string id`)
        continue
      }
      if (seenUcIds.has(uc.id)) {
        errors.push(`[${source.id}] duplicate uc id: ${uc.id}`)
      }
      seenUcIds.add(uc.id)
      ucIds.add(uc.id)
    }

    ucBySourceMap.set(source.id, ucIds)
  }

  const coveredPairs = new Set()
  const gapPairs = new Set()

  for (const mapping of traceability.mappings || []) {
    if (!mapping || typeof mapping !== 'object') {
      errors.push('Every mapping must be an object')
      continue
    }

    const mappingLabel = `${mapping.sourceId || '<no-source>'}:${mapping.ucId || '<no-uc>'}`

    if (typeof mapping.sourceId !== 'string' || !sourceMap.has(mapping.sourceId)) {
      errors.push(`[${mappingLabel}] sourceId is unknown`)
      continue
    }

    const ucIds = ucBySourceMap.get(mapping.sourceId)

    if (typeof mapping.ucId !== 'string' || !ucIds?.has(mapping.ucId)) {
      errors.push(`[${mappingLabel}] ucId is unknown for source ${mapping.sourceId}`)
      continue
    }

    if (!Array.isArray(mapping.contractGroupIds) || mapping.contractGroupIds.length === 0) {
      errors.push(`[${mappingLabel}] contractGroupIds must be a non-empty array`)
    } else {
      for (const groupId of mapping.contractGroupIds) {
        if (!groupIds.has(groupId)) {
          errors.push(`[${mappingLabel}] unknown contract group id: ${groupId}`)
        }
      }
    }

    if (!Array.isArray(mapping.contractItemIds) || mapping.contractItemIds.length === 0) {
      errors.push(`[${mappingLabel}] contractItemIds must be a non-empty array`)
    } else {
      for (const itemId of mapping.contractItemIds) {
        if (!itemIds.has(itemId)) {
          errors.push(`[${mappingLabel}] unknown contract item id: ${itemId}`)
          continue
        }

        const ownerGroup = itemToGroup.get(itemId)

        if (Array.isArray(mapping.contractGroupIds) && !mapping.contractGroupIds.includes(ownerGroup)) {
          errors.push(
            `[${mappingLabel}] item ${itemId} belongs to group ${ownerGroup}, but mapping groups are ${mapping.contractGroupIds.join(', ')}`
          )
        }
      }
    }

    if (!Array.isArray(mapping.evidenceTests) || mapping.evidenceTests.length === 0) {
      const hasLockedItem =
        Array.isArray(mapping.contractItemIds) &&
        mapping.contractItemIds.some(itemId => itemStatusMap.get(itemId) === 'locked')

      if (hasLockedItem) {
        warnings.push(`[${mappingLabel}] evidenceTests is empty for locked mapping`)
      }
    } else {
      for (const testFile of mapping.evidenceTests) {
        ensureFileExists(testFile, errors, mappingLabel)
      }
    }

    coveredPairs.add(`${mapping.sourceId}::${mapping.ucId}`)
  }

  for (const gap of traceability.knownGaps || []) {
    if (!gap || typeof gap !== 'object') {
      errors.push('Every knownGaps item must be an object')
      continue
    }

    const gapLabel = `${gap.sourceId || '<no-source>'}:${gap.ucId || '<no-uc>'}`

    if (typeof gap.sourceId !== 'string' || !sourceMap.has(gap.sourceId)) {
      errors.push(`[${gapLabel}] knownGap sourceId is unknown`)
      continue
    }

    const ucIds = ucBySourceMap.get(gap.sourceId)

    if (typeof gap.ucId !== 'string' || !ucIds?.has(gap.ucId)) {
      errors.push(`[${gapLabel}] knownGap ucId is unknown for source ${gap.sourceId}`)
      continue
    }

    if (typeof gap.gapId !== 'string' || gap.gapId.length === 0) {
      errors.push(`[${gapLabel}] knownGap gapId must be a non-empty string`)
    }

    gapPairs.add(`${gap.sourceId}::${gap.ucId}`)
  }

  for (const [sourceId, ucIds] of ucBySourceMap.entries()) {
    for (const ucId of ucIds) {
      const pairKey = `${sourceId}::${ucId}`

      if (!coveredPairs.has(pairKey) && !gapPairs.has(pairKey)) {
        errors.push(`Unmapped UC pair: ${pairKey} (add mapping or knownGap)`)
      }
    }
  }

  const summary = {
    sources: sourceMap.size,
    ucPairs: Array.from(ucBySourceMap.values()).reduce((acc, ucIds) => acc + ucIds.size, 0),
    mappings: coveredPairs.size,
    knownGaps: gapPairs.size,
  }

  return { errors, warnings, summary }
}

function main() {
  try {
    const productContract = readJson(productContractFullPath, PRODUCT_CONTRACT_PATH)
    const traceability = readJson(traceabilityFullPath, TRACEABILITY_PATH)
    const { errors, warnings, summary } = validateTraceability(productContract, traceability)

    if (errors.length > 0) {
      console.error('TaskShifter traceability validation failed:')
      for (const error of errors) {
        console.error(`- ${error}`)
      }
      process.exit(1)
    }

    console.log('TaskShifter traceability validation passed.')
    if (summary) {
      console.log(
        `Sources: ${summary.sources}, UC pairs: ${summary.ucPairs}, mappings: ${summary.mappings}, known gaps: ${summary.knownGaps}`
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

import { Schema } from "effect"
import {
  AssetContentReceipt,
  type AssetContentReceipt as AssetContentReceiptValue
} from "./verified-content.ts"

const supportedImageMimeTypes = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp"
] as const

export const RetainedImageDataUrl = Schema.String.check(
  Schema.isPattern(
    /^data:image\/(?:avif|jpeg|png|webp);base64,[A-Za-z0-9+/]*={0,2}$/,
    { expected: "one canonical supported base64 image data URL" }
  )
)

export class RetainedImageAsset extends Schema.Class<RetainedImageAsset>(
  "@nycustodian/site/RetainedImageAsset"
)({
  receipt: AssetContentReceipt,
  dataUrl: RetainedImageDataUrl
}) {}

const mimeTypeByExtension: Readonly<Record<string, typeof supportedImageMimeTypes[number]>> = {
  ".avif": "image/avif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
}

export const retainedImageMimeType = (path: string): typeof supportedImageMimeTypes[number] => {
  const extension = /\.[a-z0-9]+$/.exec(path.toLowerCase())?.[0]
  const mimeType = extension === undefined ? undefined : mimeTypeByExtension[extension]
  if (mimeType === undefined) throw new Error("The retained image path has no supported MIME type")
  return mimeType
}

export const decodeCanonicalBase64 = (value: string): Uint8Array => {
  if (value.length === 0 || value.length % 4 !== 0) {
    throw new Error("The retained image base64 payload is not canonical")
  }
  let binary: string
  try {
    binary = atob(value)
  } catch (cause) {
    throw new Error("The retained image base64 payload is invalid", { cause })
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  if (encodeCanonicalBase64(bytes) !== value) {
    throw new Error("The retained image base64 payload is not canonical")
  }
  return bytes
}

export const encodeCanonicalBase64 = (bytes: Uint8Array): string => {
  let binary = ""
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

export const sha256Bytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", bytes.slice().buffer as ArrayBuffer)
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
}

export const decodeRetainedImage = (
  value: unknown
): { readonly asset: RetainedImageAsset; readonly bytes: Uint8Array; readonly mimeType: string } => {
  const asset = Schema.decodeUnknownSync(RetainedImageAsset)(value)
  const match = /^data:(image\/(?:avif|jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(
    asset.dataUrl
  )
  if (match?.[1] === undefined || match[2] === undefined) {
    throw new Error("The retained image data URL is invalid")
  }
  const expectedMimeType = retainedImageMimeType(asset.receipt.path)
  if (match[1] !== expectedMimeType) {
    throw new Error("The retained image MIME type does not match its receipt path")
  }
  const bytes = decodeCanonicalBase64(match[2])
  if (bytes.byteLength !== asset.receipt.bytes) {
    throw new Error("The retained image byte length does not match its receipt")
  }
  return { asset, bytes, mimeType: match[1] }
}

export const validateRetainedImage = async (value: unknown): Promise<RetainedImageAsset> => {
  const { asset, bytes } = decodeRetainedImage(value)
  if (await sha256Bytes(bytes) !== asset.receipt.sha256) {
    throw new Error("The retained image digest does not match its receipt")
  }
  return asset
}

export const retainImageBlob = async (
  receipt: AssetContentReceiptValue,
  blob: Blob
): Promise<RetainedImageAsset> => {
  const expectedMimeType = retainedImageMimeType(receipt.path)
  if (blob.type !== expectedMimeType) {
    throw new Error("The verified image Blob MIME type does not match its receipt path")
  }
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const asset = new RetainedImageAsset({
    receipt,
    dataUrl: `data:${expectedMimeType};base64,${encodeCanonicalBase64(bytes)}`
  })
  return validateRetainedImage(asset)
}

export const sameAssetReceipt = (
  left: AssetContentReceiptValue,
  right: AssetContentReceiptValue
): boolean => left.path === right.path && left.bytes === right.bytes && left.sha256 === right.sha256

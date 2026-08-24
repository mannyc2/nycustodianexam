export interface FocusRequest<Target extends string> {
  readonly id: string
  readonly target: Target
}

export interface AnnouncementRequest {
  readonly id: string
  readonly message: string
}

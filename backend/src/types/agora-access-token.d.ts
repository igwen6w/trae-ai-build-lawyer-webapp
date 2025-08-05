declare module 'agora-access-token' {
  export interface RtcTokenBuilder {
    buildTokenWithUid(
      appId: string,
      appCertificate: string,
      channelName: string,
      uid: number,
      role: number,
      privilegeExpiredTs: number
    ): string;
  }

  export interface RtcRole {
    PUBLISHER: number;
    SUBSCRIBER: number;
  }

  export const RtcTokenBuilder: RtcTokenBuilder;
  export const RtcRole: RtcRole;
}
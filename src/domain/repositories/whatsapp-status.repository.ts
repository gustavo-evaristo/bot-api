export abstract class IWhatsappStatusRepository {
  /**
   * Returns the phone number currently connected via Baileys for the given
   * user, or null if there is no active session. Used to compute per-flow
   * connection status by comparing against flows.phoneNumber.
   */
  abstract getConnectedPhone(userId: string): Promise<string | null>;
}

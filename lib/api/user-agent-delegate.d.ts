import { Invitation } from "./invitation";
import { Message } from "./message";
import { Notification } from "./notification";
import { Referral } from "./referral";
import { Subscription } from "./subscription";
/**
 * Delegate for {@link UserAgent}.
 * @public
 */
export interface UserAgentDelegate {
    /**
     * Called upon receipt of an invitation.
     * @remarks
     * Handler for incoming out of dialog INVITE requests.
     * @param invitation - The invitation.
     */
    onInvite?(invitation: Invitation): void;
    /**
     * Called upon receipt of a message.
     * @remarks
     * Handler for incoming out of dialog MESSAGE requests.
     * @param message - The message.
     */
    onMessage?(message: Message): void;
    /**
     * Called upon receipt of a notification.
     * @remarks
     * Handler for incoming out of dialog NOTIFY requests.
     * @param notification - The notification.
     */
    onNotify?(notification: Notification): void;
    /**
     * Called upon receipt of a referral.
     * @remarks
     * Handler for incoming out of dialog REFER requests.
     * @param referral - The referral.
     */
    onRefer?(referral: Referral): void;
    /**
     * Called upon receipt of a subscription.
     * @remarks
     * Handler for incoming out of dialog SUBSCRIBE requests.
     * @param subscription - The subscription.
     */
    onSubscribe?(subscription: Subscription): void;
}
//# sourceMappingURL=user-agent-delegate.d.ts.map
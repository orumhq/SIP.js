import { OutgoingRequestDelegate, RequestOptions } from "../core";
import { SessionDescriptionHandlerModifier, SessionDescriptionHandlerOptions } from "./session-description-handler";
/**
 * Options for {@link Inviter.invite}.
 * @public
 */
export interface InviterInviteOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
}
//# sourceMappingURL=inviter-invite-options.d.ts.map
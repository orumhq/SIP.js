import { OutgoingRequestDelegate, RequestOptions } from "../core";
import { SessionDescriptionHandlerModifier, SessionDescriptionHandlerOptions } from "./session-description-handler";
/**
 * Options for {@link Session.invite}.
 * @public
 */
export interface SessionInviteOptions {
    /** See `core` API. */
    requestDelegate?: OutgoingRequestDelegate;
    /** See `core` API. */
    requestOptions?: RequestOptions;
    sessionDescriptionHandlerModifiers?: Array<SessionDescriptionHandlerModifier>;
    sessionDescriptionHandlerOptions?: SessionDescriptionHandlerOptions;
}
//# sourceMappingURL=session-invite-options.d.ts.map
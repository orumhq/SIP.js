/// <reference types="node" />
import { EventEmitter } from "events";
import { Subscription as SubscriptionDialog } from "../core";
import { Emitter } from "./emitter";
import { SubscriptionDelegate } from "./subscription-delegate";
import { SubscriptionOptions } from "./subscription-options";
import { SubscriptionState } from "./subscription-state";
import { SubscriptionSubscribeOptions } from "./subscription-subscribe-options";
import { SubscriptionUnsubscribeOptions } from "./subscription-unsubscribe-options";
import { UserAgent } from "./user-agent";
/**
 * A subscription provides asynchronous {@link Notification} of events.
 *
 * @remarks
 * See {@link Subscriber} for details on establishing a subscription.
 *
 * @public
 */
export declare abstract class Subscription extends EventEmitter {
    /**
     * Property reserved for use by instance owner.
     * @defaultValue `undefined`
     */
    data: any | undefined;
    /**
     * Subscription delegate. See {@link SubscriptionDelegate} for details.
     * @defaultValue `undefined`
     */
    delegate: SubscriptionDelegate | undefined;
    /**
     * If the subscription state is SubscriptionState.Subscribed, the associated subscription dialog. Otherwise undefined.
     * @internal
     */
    dialog: SubscriptionDialog | undefined;
    /** @internal */
    protected userAgent: UserAgent;
    private _disposed;
    private _logger;
    private _state;
    private _stateEventEmitter;
    /**
     * Constructor.
     * @param userAgent - User agent. See {@link UserAgent} for details.
     * @internal
     */
    protected constructor(userAgent: UserAgent, options?: SubscriptionOptions);
    /**
     * Destructor.
     * @internal
     */
    dispose(): void;
    /**
     * True if disposed.
     * @internal
     */
    readonly disposed: boolean;
    /**
     * Subscription state. See {@link SubscriptionState} for details.
     */
    readonly state: SubscriptionState;
    /**
     * Emits when the subscription `state` property changes.
     */
    readonly stateChange: Emitter<SubscriptionState>;
    /**
     * Sends a re-SUBSCRIBE request if the subscription is "active".
     */
    abstract subscribe(options?: SubscriptionSubscribeOptions): Promise<void>;
    /**
     * Unsubscribe from event notifications.
     *
     * @remarks
     * If the subscription state is SubscriptionState.Subscribed, sends an in dialog SUBSCRIBE request
     * with expires time of zero (an un-subscribe) and terminates the subscription.
     * Otherwise a noop.
     */
    abstract unsubscribe(options?: SubscriptionUnsubscribeOptions): Promise<void>;
    /** @internal */
    protected stateTransition(newState: SubscriptionState): void;
}
//# sourceMappingURL=subscription.d.ts.map
import React, { useState } from "react";
import pluralize from "pluralize";
import { UserMedia } from "~/features/users";
import TimeAgo from "react-timeago";
import { Task } from "../../stream";
import { Product } from "~/features/products/";
import { Link } from "~/routes";
import { mapStateToProps as mapUserToProps } from "~/ducks/user";
import { connect } from "react-redux";

import InfiniteScroll from "react-infinite-scroll-component";
import NoActivityCard from "~/features/stream/components/NoActivityCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StreamFinished from "~/features/stream/components/Stream/components/StreamFinished";
import Spinner from "~/components/Spinner";
import { isServer, isDev } from "~/config";
import Markdown from "~/components/Markdown";
import TaskActivityGroup from "../TaskActivityGroup";
import AdIntersitial from "../AdIntersitial";
import "./index.scss";
import ReplyFaces from "../../discussions/ReplyFaces";
import {
    Activity as ActivityContainer,
    normalizeTimezones,
    orderActivities
} from "~/vendor/stream";
import { Praisable } from "../../stream/components/Task/components/Praise";
import CommentsBox from "../../comments/components/CommentsBox";
import TaskDetail from "../../stream/components/Task/components/TaskDetail";

import { ErrorBoundary } from "react-error-boundary";
import FullName from "../../../components/FullName";

function ErrorFallback({ error, componentStack, resetErrorBoundary }) {
    return isDev ? <div>An activity broke the site.</div> : null;
}

function getTargetTitle(type, target) {
    if (!target) return null;

    if (type === "thread") {
        return `"${target.title}"`;
    }

    return null;
}

function ItemLink({
    type,
    item,
    children,
    loggedInOnly = false,
    isLoggedIn = true
}) {
    if (!item) return children;

    if (loggedInOnly && !isLoggedIn) {
        return (
            <Link route="start">
                <a target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            </Link>
        );
    }
    switch (type) {
        case "task":
            return (
                <Link route="task-page" params={{ id: item.id }}>
                    <a target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </Link>
            );

        case "thread":
            return (
                <Link route="discussion-page" params={{ slug: item.slug }}>
                    <a target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </Link>
            );

        case "reply":
            return (
                <Link href={`/discussions/${item.parent}/#reply-${item.id}`}>
                    <a target="_blank" rel="noopener noreferrer">
                        {children}
                    </a>
                </Link>
            );

        default:
            return children;
    }
}

ItemLink = connect(mapUserToProps)(ItemLink);

function getHumanTargetType(activity) {
    let getPrefix = count => (count == 1 ? "a" : count);
    if (activity.getType() === "aggregated") {
        const count = activity.getRawChildren().length;
        const targetType = activity.childrenHaveSameTargetType()
            ? activity.getRawChildren()[0].target_type
            : null;
        const target = activity.childrenHaveSameTargetType()
            ? activity.getTargetObject()
            : null;
        if (!targetType) {
            return null;
        }
        const typeText = pluralize(targetType, count);
        const targetTitle = getTargetTitle(targetType, target);
        if (targetTitle) {
            return count == 1 ? (
                <ItemLink item={target} type={targetType}>
                    {targetTitle}
                </ItemLink>
            ) : (
                `${targetTitle}`
            );
        }
        return count == 1 ? (
            <ItemLink item={target} type={targetType}>
                {getPrefix(count)} {typeText}
            </ItemLink>
        ) : (
            `${getPrefix(count)} ${typeText}`
        );
    } else {
        if (!activity.getTarget() || !activity.getTargetType()) {
            return null;
        }
        const target = activity.getTargetObject();
        const targetType = activity.getTargetType();
        const typeText = pluralize(targetType, 1);
        const targetTitle = getTargetTitle(targetType, target);
        console.log(activity, targetType);
        if (targetTitle) {
            return (
                <ItemLink item={target} type={targetType}>
                    {targetTitle}
                </ItemLink>
            );
        }
        return (
            <ItemLink item={target} type={targetType}>
                {getPrefix(count)} {typeText}
            </ItemLink>
        );
    }
}

function getHumanActivityObject(activity) {
    let getPrefix = count => (count == 1 ? "a" : count);
    if (activity.getType() === "aggregated") {
        const count = activity.getRawChildren().length;
        const objectType = activity.childrenHaveSameObjectType()
            ? activity.getObject().type
            : "thing";
        const object = activity.childrenHaveSameObjectType()
            ? activity.getObject().object
            : null;
        return count == 1 ? (
            <ItemLink item={object} type={objectType}>
                {getPrefix(count)} {pluralize(objectType, count)}
            </ItemLink>
        ) : (
            `${getPrefix(count)} ${pluralize(objectType, count)}`
        );
    } else {
        return (
            <ItemLink
                item={activity.getObject().object}
                type={activity.getObjectType()}
            >
                {getPrefix(1)} {pluralize(activity.getObjectType(), 1)}
            </ItemLink>
        );
    }
}

const ActivityTypeUnknown = ({ activity }) => {
    return (
        <div className="ActivityItemContainer">
            Unknown activity object type. <br />
            <small>
                Psst, if you see this in prod, wake up Sergio and tell him
                everything broke again.
            </small>
        </div>
    );
};

const ActivityDeleted = ({ activity }) => {
    return <div className="ActivityItemContainer">Content deleted.</div>;
};

let ActivityObject = ({ activity, ...props }) => {
    if (!activity.getObject()) return <ActivityDeleted />;
    const { object, type } = activity.getObject();
    const target = activity.getTarget();

    switch (type) {
        case "task":
            return <Task plain task={object} />;

        case "product":
            return (
                <div className="ActivityItemContainer">
                    <Product media product={object} />
                </div>
            );

        case "reply":
            return (
                <div className="ActivityItemContainer">
                    {target &&
                    target.type === "thread" &&
                    target.object.gold ? (
                        <div className={"has-text-gold heading"}>
                            <strong>
                                <FontAwesomeIcon icon="check-circle" />{" "}
                                #GoldClub only
                            </strong>
                        </div>
                    ) : null}
                    <p className="mb-em">
                        {target &&
                        target.type === "thread" &&
                        target.object.gold &&
                        (!props.me || !props.me.gold) ? (
                            <>
                                <FullName user={object.owner} /> replied to a
                                Gold thread.
                            </>
                        ) : (
                            <Markdown body={object.body} />
                        )}
                    </p>
                    <div className="actions flex flex-gap">
                        <div>
                            <ItemLink type="reply" item={object} loggedInOnly>
                                <a className="btn-light btn btn-small">Reply</a>
                            </ItemLink>
                        </div>
                        <div></div>{" "}
                        {/* <ReplyFaces threadSlug={activity.target.slug} /> */}
                    </div>
                </div>
            );

        case "thread":
            return (
                <div className={"ActivityItemContainer"}>
                    {object.gold ? (
                        <div className={"has-text-gold heading"}>
                            <strong>
                                <FontAwesomeIcon icon="check-circle" />{" "}
                                #GoldClub only
                            </strong>
                        </div>
                    ) : null}
                    <ItemLink type="thread" item={object}>
                        <h2>{object.title}</h2>
                    </ItemLink>
                    <p className="mb-em">
                        <Markdown body={object.body} />
                    </p>
                    <div
                        className="actions flex flex-gap v-center"
                        style={{ width: "100%" }}
                    >
                        <div>
                            <ItemLink type="thread" item={object}>
                                <a className="btn-light btn btn-small">Reply</a>
                            </ItemLink>
                        </div>
                        <div>
                            <ReplyFaces threadSlug={object.slug} />
                        </div>
                    </div>
                </div>
            );

        /*
        {otherReplies > 0 && (
            <small className="has-text-gray">
                ...{otherReplies} other replies
            </small>
        )}
            */

        default:
            return <ActivityTypeUnknown />;
    }
};

ActivityObject = connect(state => ({ me: state.user.me }))(ActivityObject);

const ActivityObjectGroup = ({ activities }) => {
    if (activities.length === 0) return null;
    if (activities.every(a => a.getObjectType() === "task")) {
        return <TaskActivityGroup activities={activities} />;
    }
    return activities.map(a => <ActivityObject key={a.id} activity={a} />);
};

let TaskActivityControls = ({ task, me = {} }) => {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(task.comment_count > 0);

    return (
        <div className="ActivityFeed--controls  flex flex-column TaskActivityControls">
            <div className="control-group flex">
                <Praisable
                    withFaces
                    expanded
                    className="flex-grow has-text-centered flex-v-center unstyled-btn"
                    indexUrl={`/tasks/${task.id}`}
                    initialAmount={task.praise}
                    button={true}
                    clickable
                    item={task}
                />
                <button
                    className="flex-grow has-text-centered flex-v-center"
                    onClick={e => setCommentsOpen(true)}
                >
                    <span className="mr-qt">
                        <FontAwesomeIcon icon={"comments"} />
                    </span>
                    {task.comment_count ? (
                        <>{task.comment_count} comments</>
                    ) : (
                        "Comment"
                    )}
                </button>
                <button
                    className="flex-grow has-text-centered flex-v-center"
                    onClick={e => setDetailsOpen(true)}
                >
                    {me.id === task.user.id ? (
                        <span className="mr-qt">
                            <FontAwesomeIcon icon={"edit"} />
                        </span>
                    ) : (
                        <span className="mr-qt">
                            <FontAwesomeIcon icon={"ellipsis-v"} />
                        </span>
                    )}

                    {me.id === task.user.id ? "Edit" : "More"}
                </button>
            </div>
            {detailsOpen && <TaskDetail task={task} onDelete={() => {}} />}
            {commentsOpen && (
                <CommentsBox
                    initialCommentCount={task.comment_count}
                    task={task}
                />
            )}
        </div>
    );
};

TaskActivityControls = connect(mapUserToProps)(TaskActivityControls);

const ActivityControls = ({ activity }) => {
    if (!activity.getObject() || activity.getType() === "aggregated")
        return null;
    const { object, type } = activity.getObject();

    switch (type) {
        case "task":
            return <TaskActivityControls task={object} />;
        default:
            return null;
    }
};

const Activity = ({ activity }) => {
    try {
        // order matters
        activity = new ActivityContainer(activity);
        if (!activity.check()) return null;
        // activity = cleanChildren(activity);
        return (
            <section
                className="ActivityFeed--section Activity"
                data-object-type={activity.getObjectType()}
            >
                <div className="ActivityFeed--content flex">
                    <div className="flex-grow">
                        <div className="user-info-container flex">
                            <div className="flex-grow">
                                {activity.getActorObject() &&
                                    activity.getActorObject().username && (
                                        <UserMedia
                                            user={activity.getActorObject()}
                                            extra={
                                                <span className="has-text-gray">
                                                    {activity.getVerb()}{" "}
                                                    {getHumanTargetType(
                                                        activity
                                                    ) ||
                                                        getHumanActivityObject(
                                                            activity
                                                        )}
                                                </span>
                                            }
                                            extraSmall={
                                                <>
                                                    ·{" "}
                                                    <TimeAgo
                                                        date={activity.getTime()}
                                                    />
                                                </>
                                            }
                                        />
                                    )}
                            </div>
                        </div>
                        <div
                            className={"tasks-container"}
                            style={{ width: "100%" }}
                        >
                            <small>
                                {activity.getType() === "aggregated" ? (
                                    <ActivityObjectGroup
                                        activities={activity.getChildren()}
                                    />
                                ) : (
                                    <ActivityObject activity={activity} />
                                )}
                            </small>
                        </div>
                    </div>
                </div>
                <ActivityControls activity={activity} />
            </section>
        );
    } catch (e) {
        return null;
    }
};

class ActivityFeed extends React.Component {
    render() {
        let data = normalizeTimezones(
            this.props.activities,
            this.props.user ? this.props.user.timezone : null
        );
        data = orderActivities(data);

        if (data.length === 0 && !this.props.hasMore && !this.props.isSyncing) {
            return this.props.noActivityComponent;
        }

        return (
            <InfiniteScroll
                dataLength={data.length}
                next={this.props.loadMore}
                hasMore={this.props.hasMore}
                style={{ overflow: "none" }}
                key={isServer}
            >
                <div className="ActivityFeed card">
                    {this.props.failed && (
                        <div
                            className="ActivityFeed--section"
                            id="ActivityFeed--failed"
                        >
                            <center>
                                <div className="flex flex-v-gap flex-column">
                                    <div>
                                        <h3>Failed to load the feed.</h3>
                                    </div>
                                    <div>
                                        <button
                                            className="btn btn-light "
                                            onClick={this.props.loadMore}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </center>
                        </div>
                    )}

                    <ErrorBoundary
                        FallbackComponent={ErrorFallback}
                        onReset={() => {
                            // reset the state of your app so the error doesn't happen again
                        }}
                    >
                        {Object.entries(data).map(([k, v]) => {
                            if (k != 0 && k != 1 && k % 10 == 0) {
                                return (
                                    <>
                                        <AdIntersitial />
                                        <Activity key={v.id} activity={v} />
                                    </>
                                );
                            } else {
                                return <Activity key={v.id} activity={v} />;
                            }
                        })}
                    </ErrorBoundary>

                    {this.props.hasMore && (
                        <div className={"center ActivityFeed--section"}>
                            <button
                                className={
                                    "btn btn-light" +
                                    (this.props.isSyncing ? " is-loading" : "")
                                }
                                onClick={this.props.loadMore}
                            >
                                <FontAwesomeIcon icon={"arrow-circle-down"} />{" "}
                                Load more activity...
                            </button>
                        </div>
                    )}
                    {!this.props.hasMore && this.props.isSyncing && (
                        <div className={"center ActivityFeed--section"}>
                            <Spinner text="Loading the makerness..." />
                        </div>
                    )}
                    {!this.props.hasMore &&
                        !this.props.isSyncing &&
                        !this.props.failed && (
                            <div className="ActivityFeed--section">
                                <StreamFinished />
                            </div>
                        )}
                </div>
            </InfiniteScroll>
        );
    }
}

ActivityFeed.defaultProps = {
    noActivityComponent: <NoActivityCard />,
    activities: []
};

export default ActivityFeed;

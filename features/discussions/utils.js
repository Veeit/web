import React from "react";
import ReplyFaces from "~/features/discussions/ReplyFaces";
import TimeAgo from "react-timeago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "~/routes";

export function getThreadInfoBar(thread) {
    return (
        <small className={"flex center spaced v-center"}>
            {thread.pinned && (
                <div className={"is-brand-green"}>
                    <strong>
                        <FontAwesomeIcon size="xs" icon={"thumbtack"} /> Pinned
                    </strong>
                </div>
            )}
            <div>
                <ReplyFaces threadSlug={thread.slug} withOwner={false} />
            </div>
            <div>
                <Link route={"discussion-page"} params={{ slug: thread.slug }}>
                    <a>{thread.reply_count} comments</a>
                </Link>
            </div>
            <div>20 points</div>
            <div>
                <TimeAgo date={thread.created_at} />
            </div>
            <div>by @{thread.owner.username}</div>
        </small>
    );
}
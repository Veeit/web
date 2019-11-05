import React from "react";
import PropTypes from "prop-types";
import {Link} from "~/routes";
import Emoji from "~/components/Emoji";
import {Entry} from "~/features/stream";
import TimeAgo from "react-timeago";
import {Product} from "~/features/products";
import uniqBy from "lodash/uniqBy";
import MilestoneMedia from "../../milestones/components/MilestoneMedia";

function renderPolymorphicPraise(n) {
    if (n.target_type === "task")
        return <Entry withAttachment={false} task={n.target} />;
    if (n.target_type === "milestone")
        return <MilestoneMedia xs withIcon={false} milestone={n.target} />;
}

const Notification = ({ notification, grouped = false }) => {
    let notificationImage = null;
    let notificationHtml = "Error parsing notification.";

    let key = "";

    if (grouped && notification.length > 0) {
        key = notification[0].key;
    } else {
        key = notification.key;
    }

    try {
        switch (key) {
            case "received_praise":
                if (grouped) {
                    notificationImage = "/assets/img/praise-icon.png";
                    let praiseCount = 0;
                    notification = notification.filter(n => n.target !== null);
                    notification = uniqBy(notification, n => n.target.id);
                    notification.map(n => {
                        if (n.target) {
                            praiseCount += n.target.praise;
                        }
                        return true;
                    });
                    notificationHtml = (
                        <div>
                            <strong>
                                <Emoji emoji={"👏"} /> You've got praise!
                            </strong>{" "}
                            <br />
                            <div className={"content"}>
                                You've received {praiseCount} praise. Yay!
                            </div>
                            {notification.map(n => renderPolymorphicPraise(n))}
                        </div>
                    );
                } else {
                    notificationImage = notification.actor.avatar;
                    notificationHtml = (
                        <div>
                            <strong>
                                <Emoji emoji={"👏"} /> You've got praise!
                            </strong>{" "}
                            <br />
                            <Link
                                route={"profile-page"}
                                params={{
                                    username: notification.actor.username
                                }}
                            >
                                <a>@{notification.actor.username}</a>
                            </Link>{" "}
                            {notification.verb}
                            {renderPolymorphicPraise(notification)}
                            <p className={"note"}>
                                <TimeAgo date={notification.created} />
                            </p>
                        </div>
                    );
                }
                break;

            case "followed":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"👀"} /> You got a follower
                        </h3>
                        <Link
                            route={"profile-page"}
                            params={{
                                username: notification.actor.username
                            }}
                        >
                            <a>@{notification.actor.username}</a>
                        </Link>{" "}
                        {notification.verb}.
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "user_joined":
                notificationImage = "/assets/img/icon.jpg";
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"🎉"} /> Welcome to Makerlog,{" "}
                            {notification.recipient.username}!
                        </h3>
                        <p>
                            We're glad to have you here. Here's a few links to
                            get you started.
                        </p>
                        <div className={"buttons"}>
                            <Link route={"explore"}>
                                <a className={"button is-primary is-rounded"}>
                                    Explore Makerlog
                                </a>
                            </Link>
                            <a
                                className={"button is-rounded"}
                                target={"_blank"}
                                rel="noopener noreferrer"
                                href={"https://t.me/makerlog"}
                            >
                                Join Telegram
                            </a>
                            <Link route={"settings"}>
                                <a className={"button is-rounded"}>
                                    Edit your profile
                                </a>
                            </Link>
                        </div>
                    </div>
                );
                break;

            case "broadcast":
                notificationImage = "/assets/img/icon.jpg";
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"📡"} /> Message from Makerlog
                        </h3>
                        <p>{notification.verb}</p>
                        {notification.broadcast_link && (
                            <a
                                className={"btn"}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={notification.broadcast_link}
                            >
                                View link
                            </a>
                        )}
                    </div>
                );
                break;

            case "thread_created":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"✏️"} /> @
                            {notification.actor.username} posted a topic{" "}
                        </h3>{" "}
                        <br />
                        <p>
                            @{notification.actor.username} posted a topic titled
                            "{notification.target.title}".
                        </p>
                        <Link
                            route={"discussion-page"}
                            params={{ slug: notification.target.slug }}
                        >
                            <button className={"btn"}>View thread</button>
                        </Link>
                    </div>
                );
                break;

            case "thread_replied":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"✏️"} /> @
                            {notification.actor.username} replied to{" "}
                            <Link
                                route={"discussion-page"}
                                params={{ slug: notification.target.slug }}
                            >
                                {notification.target.title}
                            </Link>
                        </h3>{" "}
                        <br />
                        <p>
                            @{notification.actor.username} replied to a thread
                            you're in.
                        </p>
                        <Link
                            route={"discussion-page"}
                            params={{ slug: notification.target.slug }}
                        >
                            <button className={"btn"}>View thread</button>
                        </Link>
                    </div>
                );
                break;

            case "task_commented":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <strong>
                            <Emoji emoji={"✏️"} /> @
                            {notification.actor.username} replied to{" "}
                            <Link
                                route={"task-page"}
                                params={{ id: notification.target.id }}
                            >
                                <a>a task.</a>
                            </Link>{" "}
                        </strong>{" "}
                        <br />
                        <Entry task={notification.target} />
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "milestone_commented":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <strong>
                            <Emoji emoji={"✏️"} /> @
                            {notification.actor.username} replied to{" "}
                            <Link
                                route={"milestone-page"}
                                params={{ slug: notification.target.slug }}
                            >
                                <a>a milestone.</a>
                            </Link>{" "}
                        </strong>{" "}
                        <br />
                        <MilestoneMedia
                            xs
                            withIcon={false}
                            milestone={notification.target}
                        />
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "product_launched":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"🚀️"} /> @
                            {notification.actor.username} launched{" "}
                            <Link
                                route={"product-page"}
                                params={{ slug: notification.target.slug }}
                            >
                                <a> a product.</a>
                            </Link>
                        </h3>
                        <p>
                            <Product media product={notification.target} />
                        </p>
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "product_created":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <h3>
                            <Emoji emoji={"🚀️"} /> @
                            {notification.actor.username} added{" "}
                            <Link
                                route={"product-page"}
                                params={{ slug: notification.target.slug }}
                            >
                                <a>a product.</a>
                            </Link>
                        </h3>
                        <p>
                            <Product media product={notification.target} />
                        </p>
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "user_mentioned":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <strong>
                            <Emoji emoji={"📣"} /> {notification.actor.username}{" "}
                            mentioned you.
                        </strong>{" "}
                        <br />
                        <p>
                            <Link
                                route="profile-page"
                                params={{
                                    username: notification.actor.username
                                }}
                            >
                                <a>@{notification.actor.username}</a>
                            </Link>{" "}
                            {notification.verb}.
                        </p>
                        {notification.target_type === "task" && (
                            <div>
                                <Link
                                    params={{ id: notification.target.id }}
                                    route="task-page"
                                >
                                    <button>View task</button>
                                </Link>
                            </div>
                        )}
                        {notification.target_type === "milestone" && (
                            <div>
                                <Link
                                    params={{ slug: notification.target.slug }}
                                    route="milestone-page"
                                >
                                    <a className="button">View milestone</a>
                                </Link>
                            </div>
                        )}
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "mention_discussion":
                notificationImage = notification.actor.avatar;
                notificationHtml = (
                    <div>
                        <strong>
                            <Emoji emoji={"📣"} /> {notification.actor.username}{" "}
                            mentioned you.
                        </strong>{" "}
                        <br />
                        <p>
                            <Link
                                route={"profile-page"}
                                params={{
                                    username: notification.actor.username
                                }}
                            >
                                <a>@{notification.actor.username}</a>
                            </Link>{" "}
                            {notification.verb}.
                        </p>
                        <Link
                            route={"discussion-page"}
                            params={{ slug: notification.target.slug }}
                        >
                            <a className="btn">View thread</a>
                        </Link>
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            case "due_tomorrow":
                notificationImage = "/assets/img/icon.jpg";
                notificationHtml = (
                    <div>
                        <strong>
                            <Emoji emoji={"✅"} /> You have tasks due tomorrow.
                        </strong>{" "}
                        <br />
                        <p>
                            Check your task list and get things done.{" "}
                            <Emoji emoji={"💪"} />
                        </p>
                        <Link route={`tasks`}>
                            <a className="btn">Check your tasks</a>
                        </Link>
                        <p className={"note"}>
                            <TimeAgo date={notification.created} />
                        </p>
                    </div>
                );
                break;

            default:
                notificationImage = "/assets/img/icon.jpg";
                notificationHtml = notification.verb;
        }
    } catch (e) {
        console.log(e);
        notificationImage = "/assets/img/icon.jpg";
        notificationHtml = "Content deleted.";
    }

    return (
        <div
            className={notification.read ? "Notification read" : "Notification"}
        >
            {notificationImage && (
                <div>
                    <img className="img-circle" src={notificationImage} />
                </div>
            )}
            {notificationHtml}
        </div>
    );
};

Notification.propTypes = {
    notification: PropTypes.object.isRequired
};

export default Notification;

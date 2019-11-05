import React from "react";
import {Link} from "~/routes";
import Markdown from "~/components/Markdown";
import Emoji from "~/components/Emoji";
import {Button, Input} from "~/vendor/bulma";
import {truncate} from "~/lib/utils/random";
import {Praisable} from "~/features/stream/components/Task/components/Praise";
import withCurrentUser from "~/features/users/containers/withCurrentUser";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {deleteMilestone, editMilestone} from "~/lib/milestones";

import "./MilestoneMedia.scss";

class MilestoneMediaComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmDelete: false,
            loadingDelete: false,
            loadingEdit: false,
            deleting: false,
            title: this.props.milestone ? this.props.milestone.title : "",
            body: this.props.milestone ? this.props.milestone.body : "",
            deleted: false,
            editing: false,
            failedEditing: false,
            failedDeleting: false
        };
    }

    onPraise = e => {
        e.preventDefault();
    };

    edit = async () => {
        this.setState({
            loadingEdit: true
        });
        try {
            await editMilestone(this.props.milestone.slug, {
                title: this.state.title,
                body: this.state.body
            });
            this.setState({
                loadingEdit: false,
                editing: false,
                failed: false
            });
        } catch (e) {
            this.setState({
                loadingEdit: false,
                failed: true
            });
        }
    };

    delete = async () => {
        if (!this.state.confirmDelete) {
            this.setState({
                confirmDelete: true
            });
            return true;
        }

        this.setState({
            deleting: true
        });

        try {
            await deleteMilestone(this.props.milestone.slug);
            this.setState({
                confirmDelete: false,
                deleting: false,
                failed: false,
                deleted: true,
                loadingDelete: false
            });
        } catch (e) {
            this.setState({
                confirmDelete: false,
                deleting: false,
                failed: true
            });
        }
    };

    render() {
        const {
            milestone,
            large = true,
            withIcon = true,
            xs = false
        } = this.props;

        return (
            <div className={"flex MilestoneMedia" + (xs ? " xs" : "")}>
                {milestone.icon && withIcon && (
                    <div>
                        <img
                            className={"img-avatar img-48"}
                            src={milestone.icon}
                        />
                    </div>
                )}
                <div>
                    <h2 className={"heading"}>Milestone</h2>
                    {!xs && !this.state.editing && <h4>{this.state.title}</h4>}
                    {xs && !this.state.editing && <h4>{this.state.title}</h4>}
                    {!xs &&
                        !this.props.stream &&
                        !this.state.deleted &&
                        !this.state.editing &&
                        this.state.body && (
                            <p className={"content"}>
                                <Markdown
                                    body={this.state.body.split("\n", 1)[0]}
                                />
                            </p>
                        )}
                    {!xs &&
                        this.props.stream &&
                        !this.state.deleted &&
                        !this.state.editing &&
                        this.state.body && (
                            <p className={"content"}>
                                <Markdown
                                    body={
                                        this.state.body.split("\n", 1)[0] +
                                        "..."
                                    }
                                />
                            </p>
                        )}
                    {this.state.editing && (
                        <>
                            <div className={"from-row"}>
                                <div className={"control"}>
                                    <Input
                                        onChange={e =>
                                            this.setState({
                                                title: e.target.value
                                            })
                                        }
                                        value={this.state.title}
                                    />
                                </div>
                            </div>
                            <div className={"from-row"}>
                                <div className={"control"}>
                                    <textarea
                                        onChange={e =>
                                            this.setState({
                                                body: e.target.value
                                            })
                                        }
                                        value={this.state.body}
                                    />
                                </div>
                            </div>
                            <Button
                                loading={this.state.loadingEdit}
                                onClick={this.edit}
                                primary
                            >
                                Submit
                            </Button>
                        </>
                    )}
                    {this.state.deleted && <em>This milestone was deleted.</em>}
                    {xs && (
                        <p className={"content"}>
                            {truncate(milestone.body, 25, "...")}
                        </p>
                    )}
                    {!xs && (
                        <div className={"buttons"} onClick={this.onPraise}>
                            <Praisable
                                button
                                indexUrl={`/milestones/${milestone.slug}`}
                                initialAmount={milestone.praise}
                                item={milestone}
                            />

                            <Link
                                route={"milestone-page"}
                                params={{ slug: milestone.slug }}
                            >
                                <a>
                                    {" "}
                                    <Emoji emoji={"💬"} />
                                    &nbsp; {milestone.comment_count}
                                </a>
                            </Link>
                            {this.props.me.id === milestone.user.id &&
                                !(this.props.xs || this.props.stream) && (
                                    <Button
                                        onClick={e =>
                                            this.setState({
                                                editing: !this.state.editing
                                            })
                                        }
                                        small
                                        className={
                                            "is-rounded" +
                                            (this.props.xs || this.props.stream
                                                ? " hidden-button"
                                                : "")
                                        }
                                    >
                                        <FontAwesomeIcon icon={"edit"} />
                                    </Button>
                                )}
                            {this.props.me.id === milestone.user.id && (
                                <Button
                                    loading={this.state.deleting}
                                    onClick={this.delete}
                                    small
                                    danger={this.state.confirmDelete}
                                    className={
                                        "is-rounded" +
                                        (this.props.xs || this.props.stream
                                            ? " hidden-button"
                                            : "")
                                    }
                                >
                                    <FontAwesomeIcon icon={"trash"} />{" "}
                                    {this.state.confirmDelete
                                        ? "Are you sure?"
                                        : ""}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

MilestoneMediaComponent = withCurrentUser(MilestoneMediaComponent);

export default ({ linked = true, ...props }) => {
    if (linked) {
        return (
            <Link
                route={"milestone-page"}
                params={{ slug: props.milestone.slug }}
            >
                <a className={"LinkWrapped"}>
                    <MilestoneMediaComponent {...props} />
                </a>
            </Link>
        );
    } else {
        return <MilestoneMediaComponent {...props} />;
    }
};
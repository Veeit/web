import React from "react";
import PropTypes from "prop-types";
import { getComments } from "~/lib/comments";
import { mapStateToProps } from "~/ducks/user";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { connect } from "react-redux";
import Spinner from "~/components/Spinner";

class CommentsBox extends React.Component {
    state = {
        loading: false,
        comments: [],
        failed: false
    };

    messagesEnd = React.createRef();

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.indexUrl !== nextProps.indexUrl) return true;
        if (nextState !== this.state) return true;
    }

    componentDidMount() {
        if (
            this.props.initialCommentCount !== undefined &&
            this.props.initialCommentCount === 0
        )
            return;
        this.getComments();
    }

    scrollToBottom = () => {
        if (!this.state.comments.length) return;
        if (!this.messagesEnd.current) return;

        if (this.messagesEnd) {
            let target = this.messagesEnd.current;
            target.parentNode.scrollTop = target.offsetTop;
        }
    };

    getIndexUrl = () => {
        let indexUrl = this.props.indexUrl;
        if (!indexUrl && this.props.task) {
            indexUrl = `/tasks/${this.props.task.id}/`;
        }
        return indexUrl;
    };

    getComments = async () => {
        this.setState({ loading: true });
        try {
            const comments = await getComments(this.getIndexUrl());
            let failed = false;
            let loading = false;
            this.setState({ comments, failed, loading }, this.scrollToBottom);
        } catch (e) {
            this.setState({ loading: false, failed: true });
        }
    };

    onCreate = c => {
        this.setState({ comments: [...this.state.comments, c] });
        this.scrollToBottom();
    };

    getId = () => {
        return `comment-box-${this.randId}`;
    };

    render() {
        return (
            <div>
                <div className="comments-box">
                    {this.state.loading && (
                        <div>
                            <Spinner small text="Loading comments..." />
                        </div>
                    )}
                    {this.state.failed && (
                        <div>
                            Couldn't load comments.{" "}
                            <button
                                className={"btn btn-light btn-small"}
                                onClick={this.getComments}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {this.state.comments.length > 0 && (
                        <div className="flex-grow">
                            <CommentList
                                indexUrl={this.getIndexUrl()}
                                comments={this.state.comments}
                            />{" "}
                            <span ref={this.messagesEnd}></span>
                        </div>
                    )}
                    {this.props.showInput && (
                        <CommentInput
                            indexUrl={this.getIndexUrl()}
                            onCreate={this.onCreate}
                            isLoading={this.state.loading}
                        />
                    )}
                </div>
            </div>
        );
    }
}

/*
<div className="comment flex">
                                <div className="comment-person">
                                    <Avatar
                                        is={24}
                                        user={this.props.task.user}
                                    />
                                </div>
                                <div className="comment-body">
                                    <a>
                                        <FullName user={this.props.task.user} />
                                    </a>
                                    This is a fake comment.
                                </div>
                            </div>
                            <div className="comment flex">
                                <div className="comment-person">
                                    <Avatar
                                        is={24}
                                        user={this.props.task.user}
                                    />
                                </div>
                                <div className="comment-body">
                                    <a>
                                        <FullName user={this.props.task.user} />
                                    </a>
                                    This is another fake comment.
                                </div>
                            </div>
*/

/*


                <div className="card">
                    <div className={"card-content"}>
                        {this.state.comments &&
                            !this.props.isLoggedIn &&
                            this.state.comments.length === 0 && (
                                <h4 className={"center"}>
                                    No comments yet.{" "}
                                        <a>Sign in or join</a>
                                    </Link>{" "}
                                    to post a comment!
                                </h4>
                            )}
                        {this.state.comments &&
                            this.props.isLoggedIn &&
                            this.state.comments.length === 0 && (
                                <h4 className={"center"}>
                                    No comments yet. Start the conversation!
                                    <Emoji emoji={"👇"} />
                                </h4>
                            )}
                        {this.state.comments && this.state.comments.length > 0 && (
                            <div
                                style={{ maxHeight: "50vh", overflow: "auto" }}
                            >
                                <CommentList
                                    indexUrl={this.props.indexUrl}
                                    comments={this.state.comments}
                                />

                                <div ref={this.messagesEnd} />
                            </div>
                        )}
                    </div>
                    <footer>
                        <CommentInput
                            
                        />
                    </footer>
                </div>
*/

CommentsBox.propTypes = {
    task: PropTypes.object
};

CommentsBox.defaultProps = {
    showInput: true
};

export default connect(mapStateToProps)(CommentsBox);

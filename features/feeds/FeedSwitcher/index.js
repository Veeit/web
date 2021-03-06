import React, { Component } from "react";
import { connect } from "react-redux";
import { actions as appActions } from "~/ducks/app";
import Sticky from "react-stickynode";
import "./index.scss";
import { isServer } from "../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Track } from "../../../vendor/ga";

class FeedSwitcher extends Component {
    state = {
        showScrollTop: false
    };

    onScroll = () => {
        if (
            document.body.scrollTop > 300 ||
            document.documentElement.scrollTop > 300
        ) {
            this.setState({ showScrollTop: true });
        } else {
            this.setState({ showScrollTop: false });
        }
    };
    componentDidMount() {
        window.addEventListener("scroll", this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    }

    onClickItem = tab => {
        new Track().event(
            `activityfeed-switch-${tab ? tab : "default"}`,
            `Switched from ${
                this.props.currentFeed ? this.props.currentFeed : "default"
            } to ${tab ? tab : "default"}`
        );
        this.props.changeFeed(tab);
    };

    render() {
        return (
            <Sticky
                enabled={!isServer ? window.innerWidth >= 728 : false}
                top={20}
            >
                <div className="FeedSwitcher">
                    <div
                        onClick={e => this.onClickItem(null)}
                        className={
                            this.props.currentFeed === null ? "active" : ""
                        }
                    >
                        Everyone
                    </div>
                    <div
                        onClick={e => this.onClickItem("following")}
                        className="disabled"
                    >
                        <span className="relative">
                            Following <p className="info-tag">Soon</p>
                        </span>
                    </div>
                    <div
                        className={
                            this.props.currentFeed === "discussions"
                                ? "active"
                                : ""
                        }
                        onClick={e => this.onClickItem("discussions")}
                    >
                        Discussions
                    </div>
                    <div
                        className={
                            this.props.currentFeed === "tasks" ? "active" : ""
                        }
                        onClick={e => this.onClickItem("tasks")}
                    >
                        Tasks
                    </div>
                    {(!isServer ? window.innerWidth >= 728 : false) &&
                        this.state.showScrollTop && (
                            <>
                                <hr className="mt-0 mb-0" />
                                <div
                                    className="scroll-to-top"
                                    onClick={e => {
                                        if (isServer) return;
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <small className="has-text-grey">
                                        <FontAwesomeIcon
                                            icon="arrow-up"
                                            size="xs"
                                        />{" "}
                                        Back to top
                                    </small>
                                </div>
                            </>
                        )}
                </div>
            </Sticky>
        );
    }
}

export default connect(
    state => {
        return {
            currentFeed: state.app.currentFeed
        };
    },
    dispatch => ({
        changeFeed: feed => dispatch(appActions.changeFeed(feed))
    })
)(FeedSwitcher);

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import copy from "clipboard-copy";

class CopyLink extends React.Component {
    state = {
        copied: false
    };

    onClick = async () => {
        try {
            await copy(this.props.url);

            this.setState({
                copied: true
            });

            setTimeout(() => {
                this.setState({
                    copied: false
                });
            }, 2000);
        } catch (e) {}
    };

    render() {
        return (
            <button
                onClick={this.onClick}
                className={"gray-link-with-icon " + this.state.copied}
            >
                {!this.state.copied && <>{this.props.children}</>}
                {this.state.copied && (
                    <>
                        <FontAwesomeIcon icon={"check"} size={"sm"} />
                        Copied to clipboard
                        {this.props.extraPermalinkText
                            ? this.props.extraPermalinkText
                            : null}
                    </>
                )}
            </button>
        );
    }
}

class ShareBar extends React.Component {
    renderShareButtons = () => (
        <>
            {this.props.permalink && (
                <div>
                    <CopyLink url={this.props.permalink}>
                        <FontAwesomeIcon icon={"link"} size={"sm"} />
                        {!this.props.compact && "Copy Permalink"}
                        {this.props.extraPermalinkText
                            ? this.props.extraPermalinkText
                            : null}
                    </CopyLink>
                </div>
            )}
            {this.props.tweetText && (
                <div>
                    <a
                        className={"gray-link-with-icon"}
                        target={"_blank"}
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            this.props.tweetText
                        )}`}
                    >
                        <FontAwesomeIcon
                            icon={["fab", "twitter"]}
                            size={"sm"}
                        />
                        {!this.props.compact && "Tweet"}
                    </a>
                </div>
            )}
        </>
    );

    render() {
        return (
            <div className={"flex flex-mobile flex-gap-big ShareBar"}>
                {this.props.extraItemsFirst && this.props.extraItemsFirst()}

                {!this.props.rightAlignShare && this.renderShareButtons()}

                {this.props.extraItemsLeft && this.props.extraItemsLeft()}

                <div className="flex-grow"></div>

                {this.props.rightAlignShare && this.renderShareButtons()}
                {this.props.extraItemsRight && this.props.extraItemsRight()}
            </div>
        );
    }
}

ShareBar.propTypes = {};

export default ShareBar;

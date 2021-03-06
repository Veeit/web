import React from "react";
import { getThread, getThreadReplies } from "~/lib/discussions";
import HeaderBar from "~/features/discussions/HeaderBar";
import ThreadStream from "~/features/discussions/ThreadStream";
import DiscussionsPageLayout from "~/layouts/DiscussionsPage";
import "./index.scss";
import { getDiscussions } from "../../lib/discussions";

class DiscussionsPage extends React.Component {
    static async getInitialProps({ query }) {
        const layout = { className: "DiscussionsPage" };

        try {
            if (query.slug) {
                const thread = await getThread(query.slug);
                const replies = await getThreadReplies(query.slug);
                return { thread, replies, layout };
            } else {
                let threads = await getDiscussions();
                return { threads, layout };
            }
        } catch (e) {
            if (e.status_code && e.status_code === 404) {
                return { statusCode: 404 };
            } else {
                return { statusCode: 500 };
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.thread &&
            prevProps.thread &&
            this.props.thread.slug !== prevProps.thread.slug
        ) {
            this.setState({});
        }
    }

    render() {
        const { replies, thread, threads } = this.props;

        return (
            <DiscussionsPageLayout>
                <HeaderBar title="Top today" />
                <ThreadStream prefetchedData={threads} />
            </DiscussionsPageLayout>
        );
    }
}

export default DiscussionsPage;

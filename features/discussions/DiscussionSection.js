import React from "react";
import { getRecentDiscussions, getTrendingThreads } from "~/lib/discussions";
import ThreadMediaLine from "./ThreadMediaLine";
import Spinner from "../../components/Spinner";

class DiscussionSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: this.props.prefetchedThreads
                ? this.props.prefetchedThreads
                : [],
            loading: true,
            failed: false
        };
    }

    async fetchThreads() {
        this.setState({ loading: true, failed: false });
        let data = null;
        try {
            if (this.props.top) {
                data = await getTrendingThreads();
            } else {
                data = await getRecentDiscussions();
            }
            this.setState({ data: data, loading: false, failed: false });
        } catch (e) {
            this.setState({ data: null, loading: false, failed: true });
        }
    }

    componentDidMount() {
        if (!this.props.prefetchedThreads) this.fetchThreads();
    }

    render() {
        if (!this.state.data)
            return <Spinner small text="Loading discussions..." />;
        let discussions = this.state.data.filter(t => t.pinned === false);
        let pinned = this.state.data.filter(t => t.pinned);
        return (
            <div className="DiscussionSection flex flex-v-gap-half flex-column">
                {pinned.map(t => (
                    <ThreadMediaLine key={t.slug} thread={t} />
                ))}
                {discussions.map(t => (
                    <ThreadMediaLine key={t.slug} thread={t} />
                ))}
            </div>
        );
    }
}

export async function prefetchData(top = false) {
    let data = null;
    try {
        if (top) {
            data = await getTrendingThreads();
        } else {
            data = await getRecentDiscussions();
        }

        return {
            prefetchedThreads: data
        };
    } catch (e) {
        console.log("Unable to preload stream.", e);
        return {};
    }
}

export default DiscussionSection;

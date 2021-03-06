import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfiniteScroll from "react-infinite-scroll-component";
import PropTypes from "prop-types";
import React from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import Spinner from "~/components/Spinner";
import axios from "~/lib/axios";
import debounce from "lodash/debounce";
import { socketUrl } from "../lib/utils/random";
import uniqBy from "lodash/uniqBy";

class InfiniteResults extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.props.prefetchedData
            ? {
                  ready: true,
                  loading: false,
                  hasMore: this.props.prefetchedData.next !== null,
                  next: this.props.prefetchedData.next,
                  items: this.getOrderedData(this.props.prefetchedData.results),
                  failed: false
              }
            : {
                  ready: false,
                  loading: false,
                  hasMore: true,
                  next: null,
                  items: [],
                  failed: false
              };
    }

    getOrderedData = data => {
        if (this.props.orderBy) {
            return this.props.orderBy(data);
        }
        return data;
    };

    componentDidMount() {
        if (!this.state.ready) {
            this.loadMore(true);
        }

        if (this.props.withSockets && this.props.socketTypePrefix) {
            this.connect();
        }
    }

    componentWillUnmount() {
        if (this.props.withSockets && this.props.socketTypePrefix) {
            this.disconnect();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.url !== this.props.url) this.loadMore(true);
    }

    connect = () => {
        this.socket = new ReconnectingWebSocket(socketUrl(this.props.url));
        this.socket.onopen = () => {
            console.log(
                `Makerlog: Established connection to ${this.props.url}.`
            );
        };
        this.socket.onmessage = this.onWsEvent;
        this.socket.onclose = () => {
            console.log(`Makerlog: Closed connection to ${this.props.url}.`);
        };
    };

    onWsEvent = event => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case `${this.props.socketTypePrefix}.created`:
            case `${this.props.socketTypePrefix}.updated`:
                this.setState({
                    items: uniqBy([data.payload, ...this.state.items], "id")
                });
                break;

            case `${this.props.socketTypePrefix}.deleted`:
                this.setState({
                    items: this.state.items.filter(
                        t => t.id !== data.payload.id
                    )
                });
                break;

            default:
                return;
        }
    };

    disconnect = () => {
        if (this.socket) {
            this.socket.close();
        }
    };

    loadMore = debounce(async (initial = false, prefetchedData = null) => {
        let items = this.state.items;
        let ready = true;
        if (initial) {
            items = [];
            ready = false;
        }

        this.setState({ loading: true, failed: false, items, ready });
        try {
            if (!initial && !this.state.next) {
                return;
            }
            let result = null;

            if (prefetchedData && initial) {
                result = { data: prefetchedData };
            } else if (!initial) {
                result = await axios.get(this.state.next);
            } else {
                result = await axios.get(this.props.url);
            }
            result = result.data;
            let data = uniqBy([...this.state.items, ...result.results], "id");
            if (this.props.orderBy) {
                data = this.props.orderBy(data);
            }
            this.setState({
                ready: true,
                loading: false,
                items: data,
                next: result.next,
                hasMore: result.next !== null,
                failed: false
            });
        } catch (e) {
            console.log(e);
            this.setState({
                loading: false,
                failed: true
            });
        }
    }, 200);

    render() {
        const Component = this.props.component;

        if (this.props.url === "") {
            return <div className={"has-text-centered"}>No URL yet.</div>;
        }

        if (!this.state.ready) {
            return <Spinner />;
        }

        if (this.state.items.length === 0 && !this.state.loading) {
            return <div className={"has-text-centered"}>Nothing found.</div>;
        }

        return (
            <InfiniteScroll
                dataLength={this.state.items.length}
                next={this.loadMore}
                hasMore={this.state.hasMore}
                style={{ overflow: "none" }}
                className={this.props.className ? this.props.className : ""}
            >
                <div className="mb-em">
                    <Component items={this.state.items} />
                </div>

                {this.state.hasMore && (
                    <div className={"center"}>
                        <button
                            className={
                                this.state.loading
                                    ? "btn btn-light is-loading"
                                    : "btn btn-light"
                            }
                            onClick={() => this.loadMore()}
                        >
                            <FontAwesomeIcon icon={"arrow-circle-down"} />{" "}
                            &nbsp; Load more results...
                        </button>
                    </div>
                )}
                {!this.state.hasMore && this.state.loading && <Spinner />}
            </InfiniteScroll>
        );
    }
}

InfiniteResults.propTypes = {
    indexUrl: PropTypes.string
};

export default InfiniteResults;

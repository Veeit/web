import styled from "styled-components";

const SidebarLink = styled.button`
    background-color: transparent;
    width: 100%;
    border: none;
    outline: none;
    display: flex;
    flex-direction: row;
    text-align: left;
    padding: 13px;
    font-size: 18px;
    color: ${props => (props.active ? props.theme.primaryDarker : "gray")};
    font-weight: ${props => (props.active ? "bold" : "normal")};
    transition: background-color 0.3s ease;
    border-radius: 5px;
    margin-bottom: 2px;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
        "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif;
    align-items: center;

    &:hover {
        color: white;
        background-color: ${props => props.theme.primaryDarker} !important;
    }

    &:last-child {
        margin-bottom: 0px;
    }

    & > .menu-icon {
        flex: 1;
        margin-right: 5px;
    }

    & > span {
        flex: 6;
        height: 100%;
    }
`;

export default SidebarLink;
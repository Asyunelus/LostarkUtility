import React from 'react'

export default class UserInfo extends React.Component {
    render() {
        return (
            <div>
                <h1>유저정보페이지</h1>
                <h2>{this.props.name} 님의 정보</h2>
            </div>
        );
    }
}
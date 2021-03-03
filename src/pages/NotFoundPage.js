import React from 'react'
import Typography from '@material-ui/core/Typography';

export default class NotFoundPage extends React.Component {
    cause_desc = (code) => {
        switch(code) {
            case 'NOT_FOUND_PAGE':
                return "페이지를 찾을 수 없습니다!";
            case 'CALCULATE_ERROR':
                return "내부 연산 중 문제가 발생했습니다!";
            case 'LOGIC_ERROR':
                return "내부 코드가 정상적으로 동작하지 않았습니다!";
            case "CONNECTION_LOSTARK_ERROR":
                return "로스트아크 서버에 연결하는데 실패했습니다! (로스트아크 서버 로직이 변경되었거나, 점검중입니다.)";
        }
        return "-";
    };
    render() {
        return (
            <div>
                <h1>무언가 문제가 발생했습니다!</h1>
                <Typography>알수 없는 문제가 발생한듯 싶습니다. 개발자에게 문의해주세요.</Typography>
                <br/>
                <Typography>Error Response : {this.props.match.params.err_code}</Typography>
                <Typography>Error Cause : {this.cause_desc(this.props.match.params.err_code)}</Typography>
            </div>
        );
    }
}
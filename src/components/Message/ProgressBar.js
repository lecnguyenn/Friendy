import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentUpload}) => (
       uploadState ==='uploading' && (<Progress 
        className="progress_bar"
        percent={percentUpload}
        progress
        indicating
        size="small"
        inverted
        />
       )
);

export default ProgressBar;
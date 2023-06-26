const { QuickSightClient, GenerateEmbedUrlForAnonymousUserCommand } = require("@aws-sdk/client-quicksight");

exports.handler = function(event, context, callback) {
    return sendRes(event, context, callback);
};

const getDashboardURL = (accountId, dashboardId, dashboardArn) => {
    return new Promise((resolve, reject) => {
        
        const getDashboardParams = {
            AwsAccountId: accountId,
            DashboardId: dashboardId,
            Namespace: 'default',
            ExperienceConfiguration: {'Dashboard':{'InitialDashboardId':dashboardId}},
            AuthorizedResourceArns: [dashboardArn],
            SessionLifetimeInMinutes: 60,
        };

        const quicksightClient = new QuickSightClient({
            region: process.env.DashboardRegion,
        });
        
        const command = new GenerateEmbedUrlForAnonymousUserCommand(getDashboardParams);

        quicksightClient.send(command).then(result => {console.log(result);resolve(result);}, err => console.log(err, err.stack))
    });
}

const sendRes = (event, context, callback) => {
    const accountId = context.invokedFunctionArn.match(/\d{3,}/)[0];
    const dashboardId = process.env.DashboardId;
    const dashboardArn = 'arn:aws:quicksight:'+process.env.DashboardRegion+':'+accountId+':dashboard/'+dashboardId

    console.log("Initial variables:");
    console.log(`accountID = ${accountId}`);
    console.log(`dashboardID = ${dashboardId}`);
    console.log(`dashboardArn = ${dashboardArn}`);

    if (!accountId) {
        const error = new Error("accountId is unavailable");
        callback(error);
    }
    if (!dashboardId) {
        const error = new Error("dashboardId is unavailable");
        callback(error);
    }
    if (!dashboardArn) {
        const error = new Error("dashboardArn is unavailable");
        callback(error);
    }

    const getDashboardEmbedUrlPromise = getDashboardURL(accountId, dashboardId, dashboardArn);
    getDashboardEmbedUrlPromise.then(function(result){
        const dashboardEmbedUrlResult = result;
        console.log(result.statusCode)
        if (dashboardEmbedUrlResult && dashboardEmbedUrlResult.Status === 200) {
            callback(null, {
                'statusCode': 200,
                'headers': { 'Access-Control-Allow-Origin': '[YOURAMPLIFYDOMAIN]',
                'Access-Control-Allow_methods': 'GET, OPTIONS',
                'Content-Type': 'text/plain'},
                'body': JSON.stringify(result)
            })
        } else {
            console.log('getDashboardEmbedUrl failed');
        }
    }, function(err){
        console.log(err, err.stack);
    });
}

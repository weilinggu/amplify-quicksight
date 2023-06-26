# amplify-quicksight lab notes
- navigation.js don't refresh after create categories, how to trigger that?
## Quicksight Embedding
https://catalog.us-east-1.prod.workshops.aws/workshops/49c5e2b4-fc43-48e7-8316-e0759cb79d35
Follow Environment Setup->Amazon Quicksight
### Step 1: Amazon Quicksight
UI has changed a bit
1. Select Single and use 1024px for target size
2. Select the fields for "Business Function" and "Employee Id"
3. Change visual to pie chart at the botton

## Step 2: Retrieve environment variables
Get Quicksight Dashboard ID
$ export acct=$(aws sts get-caller-identity --query Account --output text)
$ aws quicksight list-dashboards --aws-account-id $acct --query DashboardSummaryList[0].DashboardId --output text
Save the dashboard ID in a notepad
Get Cloud9 domain (Follow Step 3 in workshop studio to get Cloud9 access)
$ export env=$(aws cloud9 list-environments --query environmentIds[0] --output text)
$ echo "https://$(aws cloud9 describe-environments --environment-ids $env --query environments[0].id --output text).vfs.cloud9.us-east-1.amazonaws.com"
Save domain link

## Step 3: Configure Amplify Rest API
Add an API endpoint
$ amplify add api
Select REST
Enter QuicksightAnonymousEmbed
Enter /anonymous-embed
provide a lambda name AnonymousEmbedFunction
Select NodeJs
Select Helloworld
Select Yes for advanced settings
Select No on access other resources, reocurring schedule, Lambda layer
Select Yes on environment variable
Enter DashboardId
Enter [DashboardId fetched before]
Select Add new environment variable 
Enter DashboardRegion
Enter [the region you are in, for example us-east-1]
Select I\'m done
Select n for adding secret value
Select n for editing the function now
Select n for restricting access
Select n for adding another path

Add IAM policy for the function to access Quicksight
Open /RetailStore/amplify/backend/function/AnonymousEmbedFunction/custom-policies.json
Replace the file with
[
  {
   "Action": [
     "quicksight:GenerateEmbedUrlForAnonymousUser"
   ],
   "Resource": [
    "arn:aws:quicksight:*:*:namespace/default",
    "arn:aws:quicksight:*:*:dashboard/<YOUR_DASHBOARD_ID>"
   ],
    "Effect": "Allow"
  }
]
Enter Dashboard ID fetched earlier to replace <YOUR_DASHBOARD_ID>

Push API change to the Amplify Studio
$amplify push

Example code for Lambda function in NodeJs
https://github.com/amazon-archives/amazon-quicksight-embedding-sample/blob/master/QuickSightAuthentication/lambda/index.js

Quicksigh SDK documentation
https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-quicksight/classes/generateembedurlforanonymoususercommand.html

## Step 4: Embed Quicksight in Application
Install embedding sdk
npm i amazon-quicksight-embedding-sdk
Follow step 5 in the guide to embed Quicksight



# import libraries
import os
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.conversations import ConversationAnalysisClient

# get secrets
clu_endpoint = os.environ["AZURE_CONVERSATIONS_ENDPOINT"]
clu_key = os.environ["AZURE_CONVERSATIONS_KEY"]
project_name = os.environ["AZURE_CONVERSATIONS_PROJECT_NAME"]
deployment_name = os.environ["AZURE_CONVERSATIONS_DEPLOYMENT_NAME"]

# analyze quey
client = ConversationAnalysisClient(clu_endpoint, AzureKeyCredential(clu_key))
with client:
    query = "switch test branch"
    result = client.analyze_conversation(
        task={
            "kind": "Conversation",
            "analysisInput": {
                "conversationItem": {
                    "participantId": "1",
                    "id": "1",
                    "modality": "text",
                    "language": "en",
                    "text": query
                },
                "isLoggingEnabled": False
            },
            "parameters": {
                "projectName": project_name,
                "deploymentName": deployment_name,
                "verbose": True
            }
        }
    )

    print(result)

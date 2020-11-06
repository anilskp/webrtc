# socketio


--- Setup instructions all

az account set --subscription "df1510fa-ba2c-41c6-b87d-b332ec31637d"

az group create -l eastus -n askpregistry-rg

az acr create --name askpregistry --resource-group askpregistry-rg --sku basic --admin-enabled true

az acr build --subscription "Azure subscription 1" --image askp/socketdemo:v1 --registry askpregistry --file Dockerfile .

az group create -l eastus -n askpwebapp-rg


az configure --defaults  location=eastus

az appservice plan create -g askpwebapp-rg --name askpdev-plan --is-linux --sku F1


az webapp create -g askpwebapp-rg  -p askpdev-plan -n socketwebapp -i askpregistry.azurecr.io/askp/socketdemo:v1


az webapp config appsettings set --resource-group askpwebapp-rg --name socketwebapp --settings WEBSITES_PORT=5000

-- delete resource group 
az group delete -n askpregistry-rg

-- Delete registry 
az acr delete -n askpregistry 

az group delete -n askpwebapp-rg
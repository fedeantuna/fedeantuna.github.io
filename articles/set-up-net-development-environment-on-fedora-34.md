---
title: 'Set up .NET Development Environment on Fedora 34'
date: '2021-05-19'
---

[Read this article on Fedora Magazine](https://fedoramagazine.org/set-up-a-net-development-environment/)

Since the release of .NET Core, .NET developers are able to develop applications for and in GNU/Linux using languages like C#. If you are a .NET developer wanting to use Fedora Linux as your main workstation, this article is for you. I’ll demonstrate how to set up a full development environment for .NET on Fedora Linux, including an IDE/Text Editor, _Azure Functions_ and an SSL certificate for a secure _https_ site. There are multiple options for Text Editor and IDE, but here we cover _Visual Studio Code_ and _Rider_. The last one is not free but it is a great option for those familiar with _Visual Studio_ on _Windows_.

## Install .NET SDK

Until recently the _Microsoft_ repositories were required in the list of sources to be able to install dotnet through _dnf_. But that is no longer the case. Fedora has added the dotnet packages to their repositories, so installation is quite simple. Use the following two commands to install the latest _dotnet_ (.NET 5 at the moment) and the previous (.NET Core 3.1), if you want it.

```
sudo dnf install dotnet
sudo dnf install dotnet-sdk-3.1
```

That's it! Easier than ever!

## Install NodeJS

If you want to develop _Azure Functions_ or use _Azurite_ to emulate storage, you will need to have NodeJS installed. The best way to do this is to first install _nvm_ to allow installation of _NodeJS_ in user space. This means you may then install global packages without ever using _sudo_.

To install _nvm_, follow [these instructions](https://github.com/nvm-sh/nvm#install--update-script) in order to have the latest version. As of today the latest version is 0.38. Check the github site in the instructions for the latest version.

```
sudo dnf install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

Once you have _nvm_ installed, just run _nvm install lts/\*_ to install the latest LTS version of _node_ or check [here](https://github.com/nvm-sh/nvm#usage) for more options.

## Install a .NET IDE

### Visual Studio Code

Check [this guide](https://code.visualstudio.com/docs/setup/linux#_rhel-fedora-and-centos-based-distributions) in case something's changed, but as of today the process to install _Visual Studio Code_ is to import _Microsoft_ key, add the repository, and install the corresponding package.

```
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
sudo dnf check-update
sudo dnf install code
```

Now install the C# extension from _Microsoft_.

![c# extension](/images/csharp-extension.png)

That's pretty much it.

### JetBrains Rider

#### JetBrains Toolbox

If you come from _Visual Studio_ on _Windows_, this tool will feel more familiar to you. It's not free, but you have 30 days to try it out and see if you like it or not before buying a license. You can check [here](https://www.jetbrains.com/rider/buy/#personal?billing=yearly) for more information.

There are several ways to install _Rider_, but the easiest and cleanest way to do it, it's to install the _JetBrains Toolbox_ and let it manage the installation for you. To install it, navigate to [this link](https://www.jetbrains.com/toolbox-app/) and click on the _Download_ button. Make sure that the _.tar.gz_ option is selected.

If you feel more comfortable using the UI, then go to the directory where you downloaded the file using the file explorer of your Desktop Environment (_nautilus_, _dolphin_, etc.), right click on it and extract its content. Then go inside the extracted directory, right click on the _jetbrains-toolbox_ file and click on _Properties_. Make sure that the _Allow executing file as program_ checkbox under the _Permissions_ tab is checked and close the _Properties_ window. Now double click the jetbrains-toolbox file.

If you have troubles following that in your DE or if you prefer using the console, open a terminal and navigate to the directory where you downloaded the file. Then extract the content of the file, navigate into the extracted directory, add execution permissions to the AppImage and execute it. The version numbers that I am using might differ from yours, so autocomplete with the _TAB_ key instead of using copy-and-paste to avoid errors.

```
tar -xzvf jetbrains-toolbox-1.20.8352.tar.gz
cd jetbrains-toolbox-1.20.8352
chmod +x jetbrains-toolbox
./jetbrains-toolbox
```

It takes a few seconds or minutes, depending on your system and internet connection, until a small Toolbox window opens. After that you can delete the downloaded files. You will be able to open the JetBrains Toolbox from your app menu, the AppImage installs the application under _~/.local/share/JetBrains_.

<img src="/images/jetbrains-toolbox.png" alt="jetbrains toolbox" width="300" />

#### Rider

In the _JetBrains Toolbox_, search for the _Rider_ app and click Install. If you want to change where it's going to be installed and other options, check first the settings (top right corner).

When the installation finishes, open _Rider_. The first screen you'll see is to opt-in in sending anonymous statistics to the _JetBrains_ team. You can choose whatever you prefer there. The second one is to import your settings. If you've never used _Rider_ before, click on _Do not import settings_ and _OK_. After that, you'll be prompted to choose a theme and keymap. Choose whatever feels more comfortable. Click next on every other screen until you reach the _License_ window. If you have already bought a license, complete your JB Account or corresponding information. If you want to use the trial period, switch to _Evaluate for free_ and click on _Evaluate_. Do the same for _dotCover_ and _dotTrace_ on the _Plugins_ section on the left panel. Then click _Continue_.

That's it! We now have Rider installed. You can change the options selected going to _Configure -> Settings_ on the initial screen or _File -> Settings_ on the editor.

## Azure Functions and Azurite

To be able to develop Azure Functions we need to install the _azurite_ node package. The _azurite_ package allows you to emulate storage which is needed for some types of Azure Functions.

```
npm install -g azurite
```

You can read more about Azurite and how to use it [here](https://github.com/Azure/Azurite).

### Visual Studio Code

To develop Azure Functions with _VSCode_, we need to also install the _azure-functions-core-tools_ package. As of today, the latest version is v3. Check [here](https://github.com/Azure/azure-functions-core-tools) to find the latest version and more information on how to use the tool. Run _npm i -g azure-functions-core-tools@3 --unsafe-perm true_ if you want to install v3 or _npm i -g azure-functions-core-tools@2 --unsafe-perm true_ if you want to install v2.

Then we just need to install the _Azure Functions_ extension from _Microsoft_. Once the extension is installed, you can go to the _Azure_ icon on the left panel and create a new Azure Function from the templates.

### JetBrains Rider

On _Rider_, we first need to install the _Azure Toolkit for Rider_ plugin. Once the plugin is installed, restart the IDE. Then go to _Settings -> Tools -> Azure -> Functions_. If you want to manage the _azure-functions-core-tools_ by yourself manually, install the package like described in the _Visual Studio Code_ section and then specify the _Azure Functions Core Tools Path_ by hand. Otherwise, if you want _Rider_ to handle updates and the package automatically, click on _Download latest version..._ and make sure that the option _Check updates for Azure Function Core tools on startup_ is checked.

Then navigate to _Tools -> Azure -> Azurite_ and on the _Azurite package path_ dropdown, select your installation of Azurite. It should look something like _~/.nvm/versions/node/v14.16.1/lib/node_modules/azurite_.

Click _Save_ and now you are ready to create Azure Functions. If you click _New Solution_ you should see the Azure Functions templates on the menu.

## Create a SSL Certificate for your .NET apps

You won't be able to trust the .NET certificate generated by _dotnet dev-certs https --trust_. That command has no effect for us on Fedora Linux.

This article doesn't cover the details for _easy-rsa_ or the concepts for the SSL Certificate. If you are interested into learning more about this, please check these sources:

-   [SSL](https://www.ssl.com/faqs/faq-what-is-ssl/)
-   [CA](https://www.ssl.com/faqs/what-is-a-certificate-authority/)
-   [pfx](https://www.ssl.com/how-to/create-a-pfx-p12-certificate-file-using-openssl/)
-   [easy-rsa](https://github.com/OpenVPN/easy-rsa)

First, install the _easy-rsa_ tool. Then create your own certificate authority (CA), set your system to trust it, sign your certificate and set .NET to use the certificate.

Start with the package install and set up the working directory.

```
sudo dnf install easy-rsa
cd ~
mkdir .easyrsa
chmod 700 .easyrsa
cd .easyrsa
cp -r /usr/share/easy-rsa/3/* ./
./easyrsa init-pki
```

Now create a file called _vars_ with the CA details. If you know what you are doing, feel free to change these values.

```
cat << EOF > vars
set_var EASYRSA_REQ_COUNTRY    "US"
set_var EASYRSA_REQ_PROVINCE   "Texas"
set_var EASYRSA_REQ_CITY       "Houston"
set_var EASYRSA_REQ_ORG        "Development"
set_var EASYRSA_REQ_EMAIL      "local@localhost.localdomain"
set_var EASYRSA_REQ_OU         "LocalDevelopment"
set_var EASYRSA_ALGO           "ec"
set_var EASYRSA_DIGEST         "sha512"
EOF
```

Now , build the CA and trust it. When you run the first command it will prompt for the CA name, you can just press enter to leave the default value.

```
./easyrsa build-ca nopass
sudo cp ./pki/ca.crt /etc/pki/ca-trust/source/anchors/easyrsaca.crt
sudo update-ca-trust
```

Next, create the request for our CA and sign it. After executing the last command, type _yes_ and press enter.

```
mkdir req
cd req
openssl genrsa -out localhost.key
openssl req -new -key localhost.key -out localhost.req -subj /C=US/ST=Texas/L=Houston/O=Development/OU=LocalDevelopment/CN=localhost
cd ..
./easyrsa import-req ./req/localhost.req localhost
./easyrsa sign-req server localhost
```

Now, place all the files needed inside a common directory and create the _pfx_ cert. After the final command you will be prompted for a password. Type anything you want. Be sure to remember your password and keep it secret.

```
cd ~
mkdir .certs
cp .easyrsa/pki/issued/localhost.crt .certs/localhost.crt
cp .easyrsa/req/localhost.key .certs/localhost.key
cd .certs
openssl pkcs12 -export -out localhost.pfx -inkey localhost.key -in localhost.crt
```

Finally, edit the _~/.bashrc_ file and add the following environment variables.

```
cat << EOF >> .bashrc
# .NET
export ASPNETCORE_Kestrel__Certificates__Default__Password="PASSWORD"
export ASPNETCORE_Kestrel__Certificates__Default__Path="/home/YOUR_USERNAME/.certs/localhost.pfx"
EOF
```

Remember to replace _PASSWORD_ for your actual password and _YOUR_USERNAME_ for your actual username.

Reboot your system (there are other ways to do this, but rebooting is the easiest and fastest one). And that's it! You can now develop using .NET with _https_ on your Fedora Linux system!

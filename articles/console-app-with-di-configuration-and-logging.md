---
title: 'How to build a .NET Core 3.1 Console Application with built-in Dependency Injection, Configuration and Logging'
date: '2020-02-08'
---

If you ever wrote an ASP.NET Core Web Application or API, you surely know that the framework itself leans you into using its own Container for Dependency Injection. The same thing happens with the Configuration and Logging features. They are great, light weight and easy to use out of the box solutions for ASP.NET Core, but not as out of the box for a simple Console Application.

I'm assuming you already have everything installed and know enough to use NuGet Packages, the basics of Dependency Injection, Configuration and Logging since we will not be diving into that here. This article is about how to set up a Console Application to take advantage of those features.

## Lets Code!

_If you just want to follow the guide without writing the code yourself, you can follow the link to my GitHub repository that has the code we are going to follow._

[GitHub Repository](https://github.com/fedeantuna/ConsoleAppWithDI)

## Adding Dependency Injection to Console App

I'll be using the Command Line Interface and Visual Studio Code on a Fedora 31 machine, but you should be able to follow this from any environment you want.

Open your terminal, create a directory and inside, a Console App project.

```
mkdir ConsoleAppWithDI
cd ConsoleAppWithDI
dotnet new sln
dotnet new console -n ConsoleAppWithDI.UI
dotnet sln add ConsoleAppWithDI.UI/ConsoleAppWithDI.UI.csproj
```

These commands will set up the typical Solution with the Console App project. Now lets add the required NuGet package for DI: Microsoft.Extensions.DependencyInjection

```
cd ConsoleAppWithDI.UI
dotnet add package Microsoft.Extensions.DependencyInjection
```

Open the solution in your favorite IDE, if you are on Windows with Visual Studio installed, you can just double click the created Solution. I'm going to open this on Visual Studio Code.

```
cd ..
code .
```

As in an ASP.NET Core Application, we will configure multiple services and instantiate a provider. So lets start by creating the Startup class in a Startup.cs file in the same directory that is our Program.cs.

```
using Microsoft.Extensions.DependencyInjection;

namespace ConsoleAppWithDI.UI
{
    public static class Startup
    {
        public static IServiceCollection ConfigureServices()
        {
            var serviceCollection = new ServiceCollection();

            // We'll come back here later to set up an entry point and
            // our services

            return serviceCollection;
        }
    }
}
```

Now lets add the class for the Entry Point of our Application. I usually name this class as EntryPoint but you can name it whatever you want!

```
using System;

namespace ConsoleAppWithDI.UI
{
    public class EntryPoint
    {
        public void Run(String[] args)
        {
            // Our logic
        }
    }
}
```

We already have the Entry Point and the Container ready to set up services, but we need to put all of this together. If we run the application like it is, it will just output "Hello world!" and ignore everything else we did. We have to replace the code on our Main method, inside our Program class, to call the DI Container and our new Entry Point.

```
using System;
using Microsoft.Extensions.DependencyInjection;

namespace ConsoleAppWithDI.UI
{
    public class Program
    {
        public static void Main(String[] args)
        {
            var services = Startup.ConfigureServices();
            var serviceProvider = services.BuildServiceProvider();

            serviceProvider.GetService<EntryPoint>().Run(args);
        }
    }
}
```

And now we register the EntryPoint class as a transient in the Startup class

```
...

public static IServiceCollection ConfigureServices()
{
    var services = new ServiceCollection();

    services.AddTransient<EntryPoint>();

    return services;
}

...
```

Alright! We have everything set up for DI! Now we are able to use our Startup class to configure the container as we would on a ASP.NET Core Application. Lets add a small service that we can inject to see if everything works as expected! Lets try to calculate the roots of a second degree polynomial, ignoring complex roots. If you don't know or don't remember, here is the formula we have to use

![quadratic formula](/images/console-app-with-di-configuration-and-logging-01.png)

Lets start by adding a QuadraticRoots entity. I won't be following any pattern here, so please don't take this as a DDD guide, it's just a simple example to test out our Dependency Injection.

```
using System;

namespace ConsoleAppWithDI.UI.Entities
{
    public class QuadraticRoots
    {
        public Double FirstRoot { get; set; }
        public Double SecondRoot { get; set; }
    }
}
```

Now we will add the Interface for our service.

```
using System;
using ConsoleAppWithDI.UI.Entities;

namespace ConsoleAppWithDI.UI.Services
{
    public interface IQuadraticService
    {
        QuadraticRoots CalculateRoots(Double a, Double b, Double c);
    }
}
```

And the actual service.

```
using System;
using ConsoleAppWithDI.UI.Entities;

namespace ConsoleAppWithDI.UI.Services
{
    public class QuadraticService : IQuadraticService
    {
        public QuadraticRoots CalculateRoots(Double a, Double b, Double c)
        {
            var discriminant = Math.Pow(b, 2) - (4 * a * c);

            if (discriminant < 0)
            {
                return null;
            }

            var quadraticRoots = new QuadraticRoots();

            if (discriminant ==  0)
            {
                quadraticRoots.FirstRoot = quadraticRoots.SecondRoot = ((- b) + (Math.Sqrt(discriminant))) / (2 * a);
            }
            else
            {
                quadraticRoots.FirstRoot = ((- b) + (Math.Sqrt(discriminant))) / (2 * a);
                quadraticRoots.SecondRoot = ((- b) - (Math.Sqrt(discriminant))) / (2 * a);
            }

            return quadraticRoots;
        }
    }
}
```

Lets go back to our Startup class so we can register our new service there.

```
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.DependencyInjection;

...

public static IServiceCollection ConfigureServices()
{
    var services = new ServiceCollection();

    services.AddSingleton<IQuadraticService, QuadraticService>();

    services.AddTransient<EntryPoint>();

    return services;
}

...
```

That's it! Now we can inject our service through a constructor into our EntryPoint class, lets try that.

```
using System;
using ConsoleAppWithDI.UI.Services;

...

public class EntryPoint
{
    private readonly IQuadraticService _quadraticService;

    public EntryPoint(IQuadraticService quadraticService)
    {
        this._quadraticService = quadraticService;
    }

...
```

Great! Lets take the arguments from the command line to set the polynomial coefficients in order (a, b, c). We need to modify the Run method in the EntryPoint class.

```
...

public void Run(String[] args)
{
    var a = Double.Parse(args[0]);
    var b = Double.Parse(args[1]);
    var c = Double.Parse(args[2]);

    var quadraticRoots = this._quadraticService.CalculateRoots(a, b, c);

    Console.WriteLine($"Polynomial: {a}x^2 + {b}x + {c}");
    if (quadraticRoots == null)
    {
        Console.WriteLine("The roots are not reals");
    }
    else if (quadraticRoots.FirstRoot == quadraticRoots.SecondRoot)
    {
        Console.WriteLine($"The double root is {quadraticRoots.FirstRoot}");
    }
    else
    {
        Console.WriteLine($"The roots are: {quadraticRoots.FirstRoot} and {quadraticRoots.SecondRoot}");
    }
}
```

It is not perfect but it works! We could have made use of some design pattern to avoid checking for nulls or doing so many checks for one simple output, but that's not the point here.

This is not hard to implement and we can have a much more sophisticated Console Application using the built-in Dependency Injection from ASP.NET Core.

We can run it from the command line, inside the project directory just execute the run command with the parameters you want for the coefficients. Since we haven't done any validation for the user inputs nor prepare for weird scenarios, it will fail if you miss a coefficient or pass text instead of numbers. You know it will... go easy on our app!

```
dotnet run 1 2 1
```

## Adding Configuration to our Console App

Go back to the terminal and navigate to the project directory. If you are using Visual Studio you can go to the NuGet Package Manager. We will install the Microsoft.Extensions.Configuration.Json package.

```
cd ConsoleAppWithDI.UI
dotnet add package Microsoft.Extensions.Configuration.Json
```

With the package in place we can go back to our IDE and add the following to the Startup class.

```
using System.IO;
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

...

public static IServiceCollection ConfigureServices()
{
    var services = new ServiceCollection();

    var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
    IConfiguration configuration = builder.Build();
    services.AddSingleton(configuration);

    services.AddSingleton<IQuadraticService, QuadraticService>();

    services.AddTransient<EntryPoint>();

    return services;
}
```

Here I'm using optional: true, reloadOnChange: false and my current directory as the BasePath, but you can change those values to whatever suits you better.

That's all! We are ready to inject the Configuration as well. Lets try to read the values for our roots calculator from our settings! First we need to create our appsettings.json file with the following content.

```
{
    "PolynomialCoefficients": {
        "A": 1,
        "B": 2,
        "C": 1
    }
}
```

If you are doing this from Visual Studio, you can just right click your new appsettings.json file, go to Properties and set the "Copy to Output Directory" to "Preserve newest". In case you are using Visual Studio Code or other Text Editor, you can do it by editing the csproj file.

```
...

<ItemGroup>
  <None Update="appsettings.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>

...
```

Now lets inject the Configuration into the EntryPoint class. We will use the values for the polynomial coefficients from the appsettings.json file. I know, we are actually making the application worse, but it's just to demo the Configuration. We are going to get rid of this later, I promise!

```
using System;
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.Configuration;

...

private readonly IQuadraticService _quadraticService;
private readonly IConfiguration _configuration;


public EntryPoint(IQuadraticService quadraticService, IConfiguration configuration)
{
    this._quadraticService = quadraticService;
    this._configuration = configuration;
}

...

public void Run(String[] args)
{
    var a = Double.Parse(this._configuration["PolynomialCoefficients:A"]);
    var b = Double.Parse(this._configuration["PolynomialCoefficients:B"]);
    var c = Double.Parse(this._configuration["PolynomialCoefficients:C"]);

...
```

If we run the application now, we can do it without any arguments. It will take the values from the appsettings file.

```
dotnet run
```

## Adding Logging to our Console App

The .NET Core Logging is not really hard to implement, but it won't write log to files or databases out of the box. I'm going to first show you how to implement it so it can write its output to the console and then to files using Serilog, an open source third party logger.

First we need to install the Microsoft.Extensions.Logging.Console package. You can do it from the NuGet Package Manager or the terminal.

```
dotnet add package Microsoft.Extensions.Logging.Console
```

Once you've done that, the only thing we need to set up the Logging is to add a small block into the Startup class

```
using System.IO;
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

...

public static IServiceCollection ConfigureServices()
{
    var services = new ServiceCollection();

    var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
    IConfiguration configuration = builder.Build();
    services.AddSingleton(configuration);

    services.AddLogging(builder =>
    {
        builder.AddConfiguration(configuration.GetSection("Logging"));
        builder.AddConsole();
    });

...
```

In order for this to work, we have to add the Logging section to our configuration. So lets delete the previous content from the appsettings.json file and place instead the Logging settings.

```
{
    "Logging": {
        "LogLevel": {
            "Default": "Debug"
        }
    }
}
```

Now we need to inject the logger in the EntryPoint class and, as I promised, change the way we tell our app the polynomial coefficients to be again by arguments.

```
using System;
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

...

private readonly IQuadraticService _quadraticService;
private readonly IConfiguration _configuration;
private readonly ILogger<EntryPoint> _logger;

public EntryPoint(IQuadraticService quadraticService, IConfiguration configuration, ILogger<EntryPoint> logger)
{
    this._quadraticService = quadraticService;
    this._configuration = configuration;
    this._logger = logger;
}

...

public void Run(String[] args)
{
    var a = Double.Parse(args[0]);
    var b = Double.Parse(args[1]);
    var c = Double.Parse(args[2]);

    this._logger.LogDebug("The coefficients have been set!");

...
```

If you now run the application you'll see the logging message in the console.

```
dotnet run 1 2 1
```

## Adding Serilog to our Console App

Lets add the Serilog packages so we can add to the Console output a text file output.

First we install the following packages:

-   Serilog.Sinks.File
-   Serilog.Extensions.Logging
-   Serilog.Settings.Configuration

```
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Extensions.Logging
dotnet add package Serilog.Settings.Configuration
```

Once those packages are added, we have to make a small change into the Startup class.

```
using System.IO;
using ConsoleAppWithDI.UI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;

...

public static IServiceCollection ConfigureServices()
{
    var services = new ServiceCollection();
    var builder = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
    IConfiguration configuration = builder.Build();

    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(configuration)
        .CreateLogger();

    services.AddLogging(builder =>
    {
        builder.AddConfiguration(configuration.GetSection("Logging"));
        builder.AddConsole();
        builder.AddSerilog();
    });

...
```

Now for the Serilog configuration we need to add another section inside the appsettings.json file.

```
{
    "Logging": {
        "LogLevel": {
            "Default": "Debug"
        }
    },
    "Serilog": {
        "MinimumLevel": "Debug",
        "WriteTo": [
            {
                "Name": "File",
                "Args": {
                    "Path": "LOG_PATH"
                }
            }
        ]
    }
}
```

Replace the LOG_PATH value with an actual path to a file, like "/home/myuser/console.log" if you are on a Linux OS or "C:\Users\MyUser\Console.log". If you run the application now you can see that the file is created and the log that you can see in the console is also stored there.

```
dotnet run 1 2 1
```

I recommend you that, if you don't know already, check out more about Serilog! This example was extremely superficial compared to what it can do. It's a really powerful tool!

[Serilog](https://serilog.net/)

## Thanks!

Thanks for reading this article! I hope this was helpful and as fun to read as it was to write! I'll leave the link to my GitHub repository with the code I've done here!

[GitHub Repository](https://github.com/fedeantuna/ConsoleAppWithDI)

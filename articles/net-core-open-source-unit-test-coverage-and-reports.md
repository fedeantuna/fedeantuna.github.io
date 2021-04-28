---
title: '.NET Core - Open Source Unit Test Coverage and Reports'
date: '2020-10-11'
---

When I work on my personal projects I normally use Visual Studio Community or Visual Studio Code. Lately I decided to pay more attention to the coverage on those projects, and being used to having the Visual Studio Enterprise subscription on my job, I tried to run the "Analyze Code Coverage for All Tests" from Visual Studio. It turns out that that options is only available for the Enterprise edition. After a second of frustration it came to my mind the question "if I depend on Visual Studio to analyze the code coverage, what am I going to do when working on my Fedora laptop?", so I did some investigation and found a way (there a lot of ways actually) to run the analysis on both, my Windows and Linux machines.

## Code on GitHub

[GitHub link](https://github.com/fedeantuna/UnitTestCoverageDemo)

## Setting up the demo projects

In order to provide a more "realistic" scenario, I will be creating multiple projects. I will also use mostly the console so it doesn't matter what OS or editor you are using, you should be able to follow along. Keep in mind that in some cases you'll to change the forward slashes to backslashes on Windows.

Open the console and navigate to any directory where you want to set up the solution and run:

```
mkdir UnitTestCoverageDemo
cd UnitTestCoverageDemo
dotnet new sln
mkdir src
mkdir tests
cd src
dotnet new classlib -n UnitTestCoverageDemo.Calculations
dotnet new classlib -n UnitTestCoverageDemo.Services
dotnet add UnitTestCoverageDemo.Services/UnitTestCoverageDemo.Services.csproj reference UnitTestCoverageDemo.Calculations/UnitTestCoverageDemo.Calculations.csproj
cd ../tests
dotnet new xunit -n UnitTestCoverageDemo.Calculations.Tests
dotnet new xunit -n UnitTestCoverageDemo.Services.Tests
dotnet add UnitTestCoverageDemo.Calculations.Tests/UnitTestCoverageDemo.Calculations.Tests.csproj reference ../src/UnitTestCoverageDemo.Calculations/UnitTestCoverageDemo.Calculations.csproj
dotnet add UnitTestCoverageDemo.Services.Tests/UnitTestCoverageDemo.Services.Tests.csproj reference ../src/UnitTestCoverageDemo.Services/UnitTestCoverageDemo.Services.csproj
cd ..
dotnet sln UnitTestCoverageDemo.sln add ./**/**/**.csproj
```

Now lets open the solution using some editor. First, delete every auto-generated class and then create a couple of classes for each non-test project.

On UnitTestCoverageDemo.Calculations, create SimpleCalculation.cs.

```
using System;

namespace UnitTestCoverageDemo.Calculations
{
    public class SimpleCalculation
    {
        public Int32 Add(Int32 n, Int32 m)
        {
            return n + m;
        }

        public Int32 Substract(Int32 n, Int32 m)
        {
            return n - m;
        }

        public Int32 Multiply(Int32 n, Int32 m)
        {
            return n * m;
        }

        public Int32 Divide(Int32 n, Int32 m)
        {
            if (m == 0)
            {
                throw new ArgumentOutOfRangeException(nameof(m));
            }

            return n / m;
        }
    }
}
```

On UnitTestCoverageDemo.Calculations, create ComplexCalculation.cs.

```
using System;

namespace UnitTestCoverageDemo.Calculations
{
    public class ComplexCalculation
    {
        public Int32 Power(Int32 n, Int32 m)
        {
            if (m == 0)
            {
                return 1;
            }

            var result = n;
            for (int i = 1; i < m; i++)
            {
                result *= n;
            }

            return result;
        }

        public Int32 Round(Decimal n)
        {
            var intPart = (Int32)n;
            var difference = n - intPart;

            if (difference >= 0.5M)
            {
                return intPart + 1;
            }

            return intPart;
        }
    }
}
```

On UnitTestCoverageDemo.Services, create FigureService.cs.

```
using System;
using UnitTestCoverageDemo.Calculations;

namespace UnitTestCoverageDemo.Services
{
    public class FigureService
    {
        private readonly SimpleCalculation _simpleCalculation;
        private readonly ComplexCalculation _complexCalculation;

        public FigureService()
        {
            // Who's got time for DI anyways?
            this._simpleCalculation = new SimpleCalculation();
            this._complexCalculation = new ComplexCalculation();
        }

        public Int32 SquareArea(Int32 s)
        {
            var area = this._complexCalculation.Power(s, 2);

            return area;
        }

        public Int32 RectangleArea(Int32 b, Int32 h)
        {
            var area = this._simpleCalculation.Multiply(b, h);

            return area;
        }

        public Int32 TriangleArea(Int32 b, Int32 h)
        {
            var doubleArea = this._simpleCalculation.Multiply(b, h);
            var area = this._simpleCalculation.Divide(doubleArea, 2);

            return area;
        }

        public Int32 RectanglePerimeter(Int32 b, Int32 h)
        {
            var halfPerimeter = this._simpleCalculation.Add(b, h);
            var perimeter = this._simpleCalculation.Multiply(halfPerimeter, 2);

            return perimeter;
        }
    }
}
```

On UnitTestCoverageDemo.Services, create MoneyService.cs.

```
using System;
using UnitTestCoverageDemo.Calculations;

namespace UnitTestCoverageDemo.Services
{
    public class MoneyService
    {
        private readonly SimpleCalculation _simpleCalculation;
        private readonly ComplexCalculation _complexCalculation;

        public MoneyService()
        {
            // Who's got time for DI anyways?
            this._simpleCalculation = new SimpleCalculation();
            this._complexCalculation = new ComplexCalculation();
        }

        public Int32 Spend(Int32 money, Int32 price)
        {
            if (money < price)
            {
                throw new ArgumentOutOfRangeException(nameof(price));
            }

            var left = this._simpleCalculation.Substract(money, price);

            return left;
        }

        public Int32 ForgetTheChange(Decimal money)
        {
            var withoutTheChange = this._complexCalculation.Round(money);

            return withoutTheChange;
        }
    }
}
```

On UnitTestCoverageDemo.Calculations.Tests, create ComplexCalculationTests.cs.

```
using System;
using Xunit;

namespace UnitTestCoverageDemo.Calculations.Tests
{
    public class ComplexCalculationTests
    {
        private readonly ComplexCalculation _sut;

        public ComplexCalculationTests()
        {
            this._sut = new ComplexCalculation();
        }

        [Theory]
        [InlineData(5, 2, 25)]
        [InlineData(2, 3, 8)]
        [InlineData(5, 0, 1)]
        public void Power_Returns_FirstParameterElevatedToTheSecondParameter(Int32 firstParameter, Int32 secondParameter, Int32 expectedResult)
        {
            // Arrange

            // Act
            var result = this._sut.Power(firstParameter, secondParameter);

            // Assert
            Assert.Equal(expectedResult, result);
        }

        [Theory]
        [InlineData(5.25, 5)]
        [InlineData(7.5, 8)]
        [InlineData(6.75, 7)]
        public void Round_Returns_RoundedNumber(Decimal number, Int32 expectedResult)
        {
            // Arrange

            // Act
            var result = this._sut.Round(number);

            // Assert
            Assert.Equal(expectedResult, result);
        }
    }
}
```

On UnitTestCoverageDemo.Services.Tests, create MoneyServiceTests.cs.

```
using System;
using Xunit;

namespace UnitTestCoverageDemo.Services.Tests
{
    public class MoneyServiceTests
    {
        private readonly MoneyService _sut;

        public MoneyServiceTests()
        {
            this._sut = new MoneyService();
        }

        [Theory]
        [InlineData(200, 50, 150)]
        [InlineData(300, 300, 0)]
        public void Spend_Returns_RemainingMoney(Int32 money, Int32 price, Int32 remaining)
        {
            // Arrange

            // Act
            var result = this._sut.Spend(money, price);

            // Assert
            Assert.Equal(remaining, result);
        }

        [Theory]
        [InlineData(10.89, 11)]
        [InlineData(250.35, 250)]
        public void ForgetTheChange_Returns_RoundedMoney(Decimal money, Int32 rounded)
        {
            // Arrange

            // Act
            var result = this._sut.ForgetTheChange(money);

            // Assert
            Assert.Equal(rounded, result);
        }
    }
}
```

## Installing required packages and tools

Now that we have our project set, we can run our tests. Open a console on the solution directory and run:

```
dotnet test
```

You'll see that they run successfully but no information about our current coverage, which of course is extremely poor. So, let's install what we need.

We need coverlet.collector NuGet package on each Unit Test project, we can check that they are installed running from the solution directory:

```
dotnet list package
```

If the package appears on the list then we are ready to go, if not (or if you want to update it) run from each project directory:

```
dotnet add package coverlet.collector
```

Now lets install the Report Generator as a global tool.

```
dotnet tool install --global dotnet-reportgenerator-globaltool
```

If already installed, run:

```
dotnet tool update --global dotnet-reportgenerator-globaltool
```

## Generating the report

To generate the reports, we need to run the test command with some additional parameters that will generate files containing information about our coverage. We will use the cobertura format here but you can read about other formats [here](https://github.com/coverlet-coverage/coverlet).

Run the following command from the solution directory:

```
dotnet test --collect:"XPlat Code Coverage" --results-directory:"./.coverage"
```

The "XPlat Code Coverage" argument is a friendly name that corresponds to the data collectors from Coverlet. You can read more about it [here](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage). The "./.coverage" is to specify the directory where the results will be stored. If none is specified, it will default to a TestResults directory inside each project.

Inside the ".coverage" directory we have now two directories with GUID as names and inside those directories we have two files named "coverage.cobertura.xml". Those files contain the result for our code coverage analysis, but unless you're fluent in XML (I'm not), then there is not much use for us as humans. So let's create a readable report that is friendlier to our eyes.

Run the following on the terminal from the solution directory:

```
reportgenerator "-reports:.coverage/**/*.cobertura.xml" "-targetdir:.coverage-report/" "-reporttypes:HTML;"
```

If we now open the index.html file inside the .coverage-report directory, we will see a much nicer report that tells us that we suck at covering because we didn't even cover half of our code, but at least we now have all the details to easily correct this.

Before continuing let's analyze the command. Our first parameter "-reports:.coverage/\*_/_.cobertura.xml" is going to find all the "coverage.cobertura.xml" files regardless of the GUID naming the directories. The second parameter "-targetdir:.coverage-report/" will just tell the Report Generator where to store the final report, and the last parameter "-reporttypes:HTML;" will generate an HTML report for us to view on the browser. If you want to know more in detail about all the possible options, you can read more here.

## Automating the process

All of this is great, but it is really painful to run this manually every time, and besides that if you think of the directory structure that is going to be created for a second, you'll see a bigger problem... yeah, that's right, unless we delete everything before the next run we will have no way to identify which files are the ones for that run, because the GUIDs are randomly generated. Let's make everything better then with some scripts. I made a couple, one for Linux and one for Windows. If you are on a MAC I assume that the Linux one will work just fine, but it might need a few modifications.

Linux Script (BASH):

```
#!/usr/bin/bash
# Parameters - Solution
SOLUTION_FILE_NAME=""
COVERAGE_COVERLET_DIR=".coverage"
COVERAGE_REPORT_DIR=".coverage-report"

# Parameters - Coverlet
DATA_COLLECTOR_FORMAT="cobertura"
COVERLET_OUTPUT_FORMAT="cobertura"
COVERLET_OUTPUT_EXTENSION=".xml"
COLLECT="XPlat Code Coverage"
COVERAGE_FILE_NAME="coverage.$COVERLET_OUTPUT_FORMAT$COVERLET_OUTPUT_EXTENSION"

# Parameters - Report Generator
REPORT_TYPES="HTML;cobertura;"
HTML_REPORT_INDEX_FILE_NAME="index.html"

# Calculated Parameters - Solution - CHANGE WITH EXTREME CAUTION
SOLUTION_DIR="$(dirname $(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd))"
SOLUTION="$SOLUTION_DIR/$SOLUTION_FILE_NAME"

# Calculated Parameters - Coverlet - CHANGE WITH EXTREME CAUTION
COVERAGE_RUN_IDENTIFIER=$(uuidgen)
COVERLET_OUTPUT="$SOLUTION_DIR/$COVERAGE_COVERLET_DIR/$COVERAGE_RUN_IDENTIFIER"

# Build and Test
dotnet test $SOLUTION --collect:"$COLLECT" --results-directory:"$COVERLET_OUTPUT" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format="$DATA_COLLECTOR_FORMAT"

# Calculated Parameters - Report Generator - CHANGE WITH EXTREME CAUTION
TARGET_DIR="$COVERAGE_REPORT_DIR/$COVERAGE_RUN_IDENTIFIER"
REPORT_HTML_FILE="$SOLUTION_DIR/$COVERAGE_REPORT_DIR/$COVERAGE_RUN_IDENTIFIER/$HTML_REPORT_INDEX_FILE_NAME"
COVERAGE_FILES=$(find $COVERLET_OUTPUT/**/* -maxdepth 1 | awk -vORS=";" '{ print $1 }' | sed "s/\;$/\n/")

# Generate Report
reportgenerator "-reports:$COVERAGE_FILES" "-targetdir:$TARGET_DIR" "-reporttypes:$REPORT_TYPES"

# Open Report
xdg-open $REPORT_HTML_FILE > /dev/null 2>&1
```

For this script to run properly you will also need to install uuidgen tool. On Fedora, CentOS and RHEL (if not already installed) it is on the util-linux package, util-linux-ng for CentOS 6. On Debian the package is called uuid-runtime. On other distributions it might be better for you to search for it online or try running the uuidgen command to see if you already have it. Remember to also grant execution permissions to the script.

```
chmod u+x run_tests.sh #or whatever name you used
```

Windows Script (Powershell):

```
# Parameters - Solution
$SolutionFileName = "WAM.sln"
$CoverageCoverletDir = ".coverage"
$CoverageReportDir = ".coverage-report"

# Parameters - Coverlet
$DataCollectorFormat = "cobertura"
$CoverletOutputFormat = "cobertura"
$CoverletOutputExtension = ".xml"
$Collect = "XPlat Code Coverage"
$CoverageFileName = "coverage.$CoverletOutputFormat$CoverletOutputExtension"

# Parameters - Report Generator
$ReportTypes = "HTML;cobertura;"
$HtmlReportIndexFileName = "index.html"

# Calculated Parameters - Solution - CHANGE WITH EXTREME CAUTION
$SolutionDir = (Get-Item $PSScriptRoot).Parent.FullName
$Solution = [IO.Path]::Combine($SolutionDir, $SolutionFileName)

# Calculated Parameters - Coverlet - CHANGE WITH EXTREME CAUTION
$CoverageRunIdentifier = [GUID]::NewGuid().ToString()
$CoverletOutput = [IO.Path]::Combine($SolutionDir, $CoverageCoverletDir, $CoverageRunIdentifier)

# Build and Test
dotnet.exe test $Solution --collect:"$Collect" --results-directory:"$CoverletOutput" -- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format="$DataCollectorFormat"

# Calculated Parameters - Report Generator - CHANGE WITH EXTREME CAUTION
$TargetDir = [IO.Path]::Combine($CoverageReportDir, $CoverageRunIdentifier)
$ReportHtmlFile = [IO.Path]::Combine($SolutionDir, $CoverageReportDir, $CoverageRunIdentifier, $HtmlReportIndexFileName)
$TestResultsDirs = Join-Path $CoverletOutput -ChildPath **\*
$CoverageFiles = (Split-Path $TestResultsDirs -Resolve | ForEach-Object -Process {[IO.Path]::Combine($_, $CoverageFileName)}) -join ";"

# Generate Report
reportgenerator.exe "-reports:$CoverageFiles" "-targetdir:$TargetDir" "-reporttypes:$ReportTypes"

# Open Report
Invoke-Item $ReportHtmlFile
```

If you create the script by copy pasting, you might need to change the execution policy to be able to run it (or sign the certificate yourself). If you change the execution policy, I would recommend to use RemoteSigned, so you can run your own scripts locally. To do that, open Powershell as administrator and run:

```
Set-ExecutionPolicy RemoteSigned
```

The scripts are kind of self explanatory at this point, feel free to change them and do any modifications. They are thought to be run from inside a scripts directory in the solution directory:

```
UnitTestCoverageDemo
|
|_ scripts
| |
| |_ run_tests.sh
| |
| |_ run_tests.ps1
|
|_ UnitTestCoverageDemo.sln
|
*
*
```

If you want to use a different directory structure, you might need to do some modifications to them. Executing this scripts will run the tests, create the coverage files, create the report and open the report.

## Thanks!

Thanks for reading this article! I hope this was helpful and as fun to read as it was to write! I'll leave the link to my GitHub repository with the code I've done here!

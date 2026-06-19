package tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.support.ui.Select;

public class TC1_FastestRouteTest {

    @Test
    public void fastestRouteTest() throws InterruptedException {

        WebDriverManager.chromedriver().setup();

        WebDriver driver = new ChromeDriver();

        driver.manage().window().maximize();

        driver.get("http://127.0.0.1:8081");

        Thread.sleep(3000);

        Select source = new Select(driver.findElement(By.id("sourceSelect")));
        source.selectByValue("J1");

        Select target = new Select(driver.findElement(By.id("targetSelect")));
        target.selectByValue("J10");
        driver.findElement(By.xpath("//button[contains(text(),'Navigate')]"))
                .click();

        Thread.sleep(3000);

        WebElement resultCard =
                driver.findElement(By.id("routeResultCard"));

        Assert.assertTrue(resultCard.isDisplayed());

        System.out.println("TC1 Passed");

        driver.quit();
    }
}
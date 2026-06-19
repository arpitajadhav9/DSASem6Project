package tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TC5_CompareRoutesTest extends BaseTest {

    @Test
    public void compareRoutesTest() throws InterruptedException {

        Thread.sleep(3000);

        driver.findElement(By.id("sourceSelect"))
                .sendKeys("J1");

        driver.findElement(By.id("targetSelect"))
                .sendKeys("J10");

        driver.findElement(
                By.xpath("//button[contains(text(),'Compare')]")
        ).click();

        Thread.sleep(3000);

        WebElement comparisonSection =
                driver.findElement(
                        By.xpath("//*[contains(text(),'Same Route')]")
                );

        Assert.assertTrue(comparisonSection.isDisplayed());

        System.out.println("TC5 Passed");
    }
}
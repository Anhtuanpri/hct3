<?php
$filename = "counter.txt";
if (!file_exists($filename)) {
    file_put_contents($filename, "0");
}

$count = (int)file_get_contents($filename);
$count++;
file_put_contents($filename, $count);
echo $count;
?>

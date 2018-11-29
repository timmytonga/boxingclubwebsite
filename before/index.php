<?php define(FORWARDED_FILE, "test.html");
$title=$h1="Boxing Club" ;$p1="This page has moved to " ;
try{
    $file=fopen(FORWARDED_FILE, 'r');
    $url=trim((string)fread($file,filesize(FORWARDED_FILE)));
    fclose($file);
}
catch(Exception $e){}?>

<!DOCTYPE html>
<html lang=en>

<head>
    <title>
        <?php echo $title; ?>
    </title>
</head>

<body>
    <p>
        <?php if (!empty($url)) { ?><a href=<?php echo $url; }?> </a>
    </p>
    <p>
        <hr />
        <p><a href=http://clubs.uci.edu>CO Web Services</a> | <a href=http://campusorgs.uci.edu>Campus Organizations</a> | <a href=http://studentlife.uci.edu>Student Life & Leadership</a> | <a href=http://uci.edu>UC Irvine</a>
        </p>
</body>

</html>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv='content-type' content='text/html;charset=utf-8'>
<meta name='robots' content='noindex,nofollow'>
<title>[<% ident(); %>] Error</title>

<% include('common-header.html'); %>

</head>
<body>
<div>
<form>

  <div class="container">
  	<div class="row">
  		<div class="span2 offset5">
    		<h1>Error</h1>
    		<p><script type='text/javascript'>
				//<% resmsg('Unknown error'); %>
				document.write(resmsg);
			</script></p>
    		<p><a class="btn btn-primary btn-large" onclick='history.go(-1)'>Go Back</a></p>
		</div>
	</div>
  </div>
</form>
</div>
</html>

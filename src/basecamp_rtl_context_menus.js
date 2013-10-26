var $ports = $([]);

function notifyDirectionToPort(index, element)
{
	console.log("Postring direction replacement to port "+ (index + 1 ) +" out of "+$ports.size());
	element.postMessage({direction: localStorage["shuoldBasecampBeLTR"]}); 
}

function notifyDirectionToAllPorts()
{
	$ports.each(notifyDirectionToPort);
}

function toggleBaseCampDirection()
{
	shuoldBaseCampBeLTR = localStorage["shuoldBasecampBeLTR"] || "yes"
	shuoldBaseCampBeLTR = shuoldBaseCampBeLTR == "yes" ? "no" : "yes"
	localStorage["shuoldBasecampBeLTR"] = shuoldBaseCampBeLTR;
	notifyDirectionToAllPorts();
}

function createContextMenuButton()
{
	chrome.contextMenus.create({title: "Switch BaseCamp Direction", 
								onclick: toggleBaseCampDirection, 
								documentUrlPatterns: ["https://*.basecamphq.com/*"]
								});
}

function bindSocketToPages()
{
	chrome.extension.onConnect.addListener(function(port) {
	$ports.push(port);
	console.log("We have "+$ports.size()+" open ports");
	port.postMessage({direction: localStorage["shuoldBasecampBeLTR"]});
	port.onMessage.addListener(function(port) { notifyDirectionToAllPorts(); });
	port.onDisconnect.addListener(function(port) { 
			index = jQuery.inArray(port, $ports);
			if (index != -1 ) $ports.splice(index, 1);
			console.log("We have "+$ports.size()+" open ports");
		});
	});
}

bindSocketToPages();
createContextMenuButton();


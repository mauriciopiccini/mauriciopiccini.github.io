// Created with Squiffy 5.0.0
// https://github.com/textadventures/squiffy

(function(){
/* jshint quotmark: single */
/* jshint evil: true */

var squiffy = {};

(function () {
    'use strict';

    squiffy.story = {};

    var initLinkHandler = function () {
        var handleLink = function (link) {
            if (link.hasClass('disabled')) return;
            var passage = link.data('passage');
            var section = link.data('section');
            var rotateAttr = link.attr('data-rotate');
            var sequenceAttr = link.attr('data-sequence');
            if (passage) {
                disableLink(link);
                squiffy.set('_turncount', squiffy.get('_turncount') + 1);
                passage = processLink(passage);
                if (passage) {
                    currentSection.append('<hr/>');
                    squiffy.story.passage(passage);
                }
                var turnPassage = '@' + squiffy.get('_turncount');
                if (turnPassage in squiffy.story.section.passages) {
                    squiffy.story.passage(turnPassage);
                }
            }
            else if (section) {
                currentSection.append('<hr/>');
                disableLink(link);
                section = processLink(section);
                squiffy.story.go(section);
            }
            else if (rotateAttr || sequenceAttr) {
                var result = rotate(rotateAttr || sequenceAttr, rotateAttr ? link.text() : '');
                link.html(result[0].replace(/&quot;/g, '"').replace(/&#39;/g, '\''));
                var dataAttribute = rotateAttr ? 'data-rotate' : 'data-sequence';
                link.attr(dataAttribute, result[1]);
                if (!result[1]) {
                    disableLink(link);
                }
                if (link.attr('data-attribute')) {
                    squiffy.set(link.attr('data-attribute'), result[0]);
                }
                squiffy.story.save();
            }
        };

        squiffy.ui.output.on('click', 'a.squiffy-link', function () {
            handleLink(jQuery(this));
        });

        squiffy.ui.output.on('keypress', 'a.squiffy-link', function (e) {
            if (e.which !== 13) return;
            handleLink(jQuery(this));
        });

        squiffy.ui.output.on('mousedown', 'a.squiffy-link', function (event) {
            event.preventDefault();
        });
    };

    var disableLink = function (link) {
        link.addClass('disabled');
        link.attr('tabindex', -1);
    }
    
    squiffy.story.begin = function () {
        if (!squiffy.story.load()) {
            squiffy.story.go(squiffy.story.start);
        }
    };

    var processLink = function(link) {
        var sections = link.split(',');
        var first = true;
        var target = null;
        sections.forEach(function (section) {
            section = section.trim();
            if (startsWith(section, '@replace ')) {
                replaceLabel(section.substring(9));
            }
            else {
                if (first) {
                    target = section;
                }
                else {
                    setAttribute(section);
                }
            }
            first = false;
        });
        return target;
    };

    var setAttribute = function(expr) {
        var lhs, rhs, op, value;
        var setRegex = /^([\w]*)\s*=\s*(.*)$/;
        var setMatch = setRegex.exec(expr);
        if (setMatch) {
            lhs = setMatch[1];
            rhs = setMatch[2];
            if (isNaN(rhs)) {
                squiffy.set(lhs, rhs);
            }
            else {
                squiffy.set(lhs, parseFloat(rhs));
            }
        }
        else {
            var incDecRegex = /^([\w]*)\s*([\+\-])=\s*(.*)$/;
            var incDecMatch = incDecRegex.exec(expr);
            if (incDecMatch) {
                lhs = incDecMatch[1];
                op = incDecMatch[2];
                rhs = parseFloat(incDecMatch[3]);
                value = squiffy.get(lhs);
                if (value === null) value = 0;
                if (op == '+') {
                    value += rhs;
                }
                if (op == '-') {
                    value -= rhs;
                }
                squiffy.set(lhs, value);
            }
            else {
                value = true;
                if (startsWith(expr, 'not ')) {
                    expr = expr.substring(4);
                    value = false;
                }
                squiffy.set(expr, value);
            }
        }
    };

    var replaceLabel = function(expr) {
        var regex = /^([\w]*)\s*=\s*(.*)$/;
        var match = regex.exec(expr);
        if (!match) return;
        var label = match[1];
        var text = match[2];
        if (text in squiffy.story.section.passages) {
            text = squiffy.story.section.passages[text].text;
        }
        else if (text in squiffy.story.sections) {
            text = squiffy.story.sections[text].text;
        }
        var stripParags = /^<p>(.*)<\/p>$/;
        var stripParagsMatch = stripParags.exec(text);
        if (stripParagsMatch) {
            text = stripParagsMatch[1];
        }
        var $labels = squiffy.ui.output.find('.squiffy-label-' + label);
        $labels.fadeOut(1000, function() {
            $labels.html(squiffy.ui.processText(text));
            $labels.fadeIn(1000, function() {
                squiffy.story.save();
            });
        });
    };

    squiffy.story.go = function(section) {
        squiffy.set('_transition', null);
        newSection();
        squiffy.story.section = squiffy.story.sections[section];
        if (!squiffy.story.section) return;
        squiffy.set('_section', section);
        setSeen(section);
        var master = squiffy.story.sections[''];
        if (master) {
            squiffy.story.run(master);
            squiffy.ui.write(master.text);
        }
        squiffy.story.run(squiffy.story.section);
        // The JS might have changed which section we're in
        if (squiffy.get('_section') == section) {
            squiffy.set('_turncount', 0);
            squiffy.ui.write(squiffy.story.section.text);
            squiffy.story.save();
        }
    };

    squiffy.story.run = function(section) {
        if (section.clear) {
            squiffy.ui.clearScreen();
        }
        if (section.attributes) {
            processAttributes(section.attributes);
        }
        if (section.js) {
            section.js();
        }
    };

    squiffy.story.passage = function(passageName) {
        var passage = squiffy.story.section.passages[passageName];
        if (!passage) return;
        setSeen(passageName);
        var masterSection = squiffy.story.sections[''];
        if (masterSection) {
            var masterPassage = masterSection.passages[''];
            if (masterPassage) {
                squiffy.story.run(masterPassage);
                squiffy.ui.write(masterPassage.text);
            }
        }
        var master = squiffy.story.section.passages[''];
        if (master) {
            squiffy.story.run(master);
            squiffy.ui.write(master.text);
        }
        squiffy.story.run(passage);
        squiffy.ui.write(passage.text);
        squiffy.story.save();
    };

    var processAttributes = function(attributes) {
        attributes.forEach(function (attribute) {
            if (startsWith(attribute, '@replace ')) {
                replaceLabel(attribute.substring(9));
            }
            else {
                setAttribute(attribute);
            }
        });
    };

    squiffy.story.restart = function() {
        if (squiffy.ui.settings.persist && window.localStorage) {
            var keys = Object.keys(localStorage);
            jQuery.each(keys, function (idx, key) {
                if (startsWith(key, squiffy.story.id)) {
                    localStorage.removeItem(key);
                }
            });
        }
        else {
            squiffy.storageFallback = {};
        }
        if (squiffy.ui.settings.scroll === 'element') {
            squiffy.ui.output.html('');
            squiffy.story.begin();
        }
        else {
            location.reload();
        }
    };

    squiffy.story.save = function() {
        squiffy.set('_output', squiffy.ui.output.html());
    };

    squiffy.story.load = function() {
        var output = squiffy.get('_output');
        if (!output) return false;
        squiffy.ui.output.html(output);
        currentSection = jQuery('#' + squiffy.get('_output-section'));
        squiffy.story.section = squiffy.story.sections[squiffy.get('_section')];
        var transition = squiffy.get('_transition');
        if (transition) {
            eval('(' + transition + ')()');
        }
        return true;
    };

    var setSeen = function(sectionName) {
        var seenSections = squiffy.get('_seen_sections');
        if (!seenSections) seenSections = [];
        if (seenSections.indexOf(sectionName) == -1) {
            seenSections.push(sectionName);
            squiffy.set('_seen_sections', seenSections);
        }
    };

    squiffy.story.seen = function(sectionName) {
        var seenSections = squiffy.get('_seen_sections');
        if (!seenSections) return false;
        return (seenSections.indexOf(sectionName) > -1);
    };
    
    squiffy.ui = {};

    var currentSection = null;
    var screenIsClear = true;
    var scrollPosition = 0;

    var newSection = function() {
        if (currentSection) {
            disableLink(jQuery('.squiffy-link', currentSection));
        }
        var sectionCount = squiffy.get('_section-count') + 1;
        squiffy.set('_section-count', sectionCount);
        var id = 'squiffy-section-' + sectionCount;
        currentSection = jQuery('<div/>', {
            id: id,
        }).appendTo(squiffy.ui.output);
        squiffy.set('_output-section', id);
    };

    squiffy.ui.write = function(text) {
        screenIsClear = false;
        scrollPosition = squiffy.ui.output.height();
        currentSection.append(jQuery('<div/>').html(squiffy.ui.processText(text)));
        squiffy.ui.scrollToEnd();
    };

    squiffy.ui.clearScreen = function() {
        squiffy.ui.output.html('');
        screenIsClear = true;
        newSection();
    };

    squiffy.ui.scrollToEnd = function() {
        var scrollTo, currentScrollTop, distance, duration;
        if (squiffy.ui.settings.scroll === 'element') {
            scrollTo = squiffy.ui.output[0].scrollHeight - squiffy.ui.output.height();
            currentScrollTop = squiffy.ui.output.scrollTop();
            if (scrollTo > currentScrollTop) {
                distance = scrollTo - currentScrollTop;
                duration = distance / 0.4;
                squiffy.ui.output.stop().animate({ scrollTop: scrollTo }, duration);
            }
        }
        else {
            scrollTo = scrollPosition;
            currentScrollTop = Math.max(jQuery('body').scrollTop(), jQuery('html').scrollTop());
            if (scrollTo > currentScrollTop) {
                var maxScrollTop = jQuery(document).height() - jQuery(window).height();
                if (scrollTo > maxScrollTop) scrollTo = maxScrollTop;
                distance = scrollTo - currentScrollTop;
                duration = distance / 0.5;
                jQuery('body,html').stop().animate({ scrollTop: scrollTo }, duration);
            }
        }
    };

    squiffy.ui.processText = function(text) {
        function process(text, data) {
            var containsUnprocessedSection = false;
            var open = text.indexOf('{');
            var close;
            
            if (open > -1) {
                var nestCount = 1;
                var searchStart = open + 1;
                var finished = false;
             
                while (!finished) {
                    var nextOpen = text.indexOf('{', searchStart);
                    var nextClose = text.indexOf('}', searchStart);
         
                    if (nextClose > -1) {
                        if (nextOpen > -1 && nextOpen < nextClose) {
                            nestCount++;
                            searchStart = nextOpen + 1;
                        }
                        else {
                            nestCount--;
                            searchStart = nextClose + 1;
                            if (nestCount === 0) {
                                close = nextClose;
                                containsUnprocessedSection = true;
                                finished = true;
                            }
                        }
                    }
                    else {
                        finished = true;
                    }
                }
            }
            
            if (containsUnprocessedSection) {
                var section = text.substring(open + 1, close);
                var value = processTextCommand(section, data);
                text = text.substring(0, open) + value + process(text.substring(close + 1), data);
            }
            
            return (text);
        }

        function processTextCommand(text, data) {
            if (startsWith(text, 'if ')) {
                return processTextCommand_If(text, data);
            }
            else if (startsWith(text, 'else:')) {
                return processTextCommand_Else(text, data);
            }
            else if (startsWith(text, 'label:')) {
                return processTextCommand_Label(text, data);
            }
            else if (/^rotate[: ]/.test(text)) {
                return processTextCommand_Rotate('rotate', text, data);
            }
            else if (/^sequence[: ]/.test(text)) {
                return processTextCommand_Rotate('sequence', text, data);   
            }
            else if (text in squiffy.story.section.passages) {
                return process(squiffy.story.section.passages[text].text, data);
            }
            else if (text in squiffy.story.sections) {
                return process(squiffy.story.sections[text].text, data);
            }
            return squiffy.get(text);
        }

        function processTextCommand_If(section, data) {
            var command = section.substring(3);
            var colon = command.indexOf(':');
            if (colon == -1) {
                return ('{if ' + command + '}');
            }

            var text = command.substring(colon + 1);
            var condition = command.substring(0, colon);

            var operatorRegex = /([\w ]*)(=|&lt;=|&gt;=|&lt;&gt;|&lt;|&gt;)(.*)/;
            var match = operatorRegex.exec(condition);

            var result = false;

            if (match) {
                var lhs = squiffy.get(match[1]);
                var op = match[2];
                var rhs = match[3];

                if (op == '=' && lhs == rhs) result = true;
                if (op == '&lt;&gt;' && lhs != rhs) result = true;
                if (op == '&gt;' && lhs > rhs) result = true;
                if (op == '&lt;' && lhs < rhs) result = true;
                if (op == '&gt;=' && lhs >= rhs) result = true;
                if (op == '&lt;=' && lhs <= rhs) result = true;
            }
            else {
                var checkValue = true;
                if (startsWith(condition, 'not ')) {
                    condition = condition.substring(4);
                    checkValue = false;
                }

                if (startsWith(condition, 'seen ')) {
                    result = (squiffy.story.seen(condition.substring(5)) == checkValue);
                }
                else {
                    var value = squiffy.get(condition);
                    if (value === null) value = false;
                    result = (value == checkValue);
                }
            }

            var textResult = result ? process(text, data) : '';

            data.lastIf = result;
            return textResult;
        }

        function processTextCommand_Else(section, data) {
            if (!('lastIf' in data) || data.lastIf) return '';
            var text = section.substring(5);
            return process(text, data);
        }

        function processTextCommand_Label(section, data) {
            var command = section.substring(6);
            var eq = command.indexOf('=');
            if (eq == -1) {
                return ('{label:' + command + '}');
            }

            var text = command.substring(eq + 1);
            var label = command.substring(0, eq);

            return '<span class="squiffy-label-' + label + '">' + process(text, data) + '</span>';
        }

        function processTextCommand_Rotate(type, section, data) {
            var options;
            var attribute = '';
            if (section.substring(type.length, type.length + 1) == ' ') {
                var colon = section.indexOf(':');
                if (colon == -1) {
                    return '{' + section + '}';
                }
                options = section.substring(colon + 1);
                attribute = section.substring(type.length + 1, colon);
            }
            else {
                options = section.substring(type.length + 1);
            }
            var rotation = rotate(options.replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
            if (attribute) {
                squiffy.set(attribute, rotation[0]);
            }
            return '<a class="squiffy-link" data-' + type + '="' + rotation[1] + '" data-attribute="' + attribute + '" role="link">' + rotation[0] + '</a>';
        }

        var data = {
            fulltext: text
        };
        return process(text, data);
    };

    squiffy.ui.transition = function(f) {
        squiffy.set('_transition', f.toString());
        f();
    };

    squiffy.storageFallback = {};

    squiffy.set = function(attribute, value) {
        if (typeof value === 'undefined') value = true;
        if (squiffy.ui.settings.persist && window.localStorage) {
            localStorage[squiffy.story.id + '-' + attribute] = JSON.stringify(value);
        }
        else {
            squiffy.storageFallback[attribute] = JSON.stringify(value);
        }
        squiffy.ui.settings.onSet(attribute, value);
    };

    squiffy.get = function(attribute) {
        var result;
        if (squiffy.ui.settings.persist && window.localStorage) {
            result = localStorage[squiffy.story.id + '-' + attribute];
        }
        else {
            result = squiffy.storageFallback[attribute];
        }
        if (!result) return null;
        return JSON.parse(result);
    };

    var startsWith = function(string, prefix) {
        return string.substring(0, prefix.length) === prefix;
    };

    var rotate = function(options, current) {
        var colon = options.indexOf(':');
        if (colon == -1) {
            return [options, current];
        }
        var next = options.substring(0, colon);
        var remaining = options.substring(colon + 1);
        if (current) remaining += ':' + current;
        return [next, remaining];
    };

    var methods = {
        init: function (options) {
            var settings = jQuery.extend({
                scroll: 'body',
                persist: true,
                restartPrompt: true,
                onSet: function (attribute, value) {}
            }, options);

            squiffy.ui.output = this;
            squiffy.ui.restart = jQuery(settings.restart);
            squiffy.ui.settings = settings;

            if (settings.scroll === 'element') {
                squiffy.ui.output.css('overflow-y', 'auto');
            }

            initLinkHandler();
            squiffy.story.begin();
            
            return this;
        },
        get: function (attribute) {
            return squiffy.get(attribute);
        },
        set: function (attribute, value) {
            squiffy.set(attribute, value);
        },
        restart: function () {
            if (!squiffy.ui.settings.restartPrompt || confirm('Are you sure you want to restart?')) {
                squiffy.story.restart();
            }
        }
    };

    jQuery.fn.squiffy = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions]
                .apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof methodOrOptions === 'object' || ! methodOrOptions) {
            return methods.init.apply(this, arguments);
        } else {
            jQuery.error('Method ' +  methodOrOptions + ' does not exist');
        }
    };
})();

var get = squiffy.get;
var set = squiffy.set;


squiffy.story.start = 'Casa';
squiffy.story.id = 'd256a28e6f';
squiffy.story.sections = {
	'Casa': {
		'text': "<p>Era uma vez uma menina triste chamada <a class=\"squiffy-link link-passage\" data-passage=\"Cinderela\" role=\"link\" tabindex=\"0\">Cinderela</a>.</p>",
		'passages': {
			'Cinderela': {
				'text': "<p>Fala sobre o <a class=\"squiffy-link link-passage\" data-passage=\"Pai\" role=\"link\" tabindex=\"0\">Pai</a>.</p>",
			},
			'Pai': {
				'text': "<p>Fala sobre o <a class=\"squiffy-link link-passage\" data-passage=\"Caminho\" role=\"link\" tabindex=\"0\">Caminho</a>.</p>",
			},
			'Caminho': {
				'text': "<p>Fala sobre o <a class=\"squiffy-link link-passage\" data-passage=\"Graveto\" role=\"link\" tabindex=\"0\">Graveto</a>.\nFala sobre o <a class=\"squiffy-link link-passage\" data-passage=\"Retorno\" role=\"link\" tabindex=\"0\">Retorno</a>.</p>",
			},
			'Graveto': {
				'text': "<p>Fala sobre o <a class=\"squiffy-link link-passage\" data-passage=\"Retorno\" role=\"link\" tabindex=\"0\">Retorno</a>.</p>",
			},
			'Retorno': {
				'text': "<p>Termina e fala sobre a <a class=\"squiffy-link link-section\" data-section=\"Árvore\" role=\"link\" tabindex=\"0\">Árvore</a>.</p>",
			},
		},
	},
	'Árvore': {
		'text': "<p>Fala sobre a <a class=\"squiffy-link link-passage\" data-passage=\"filha1\" role=\"link\" tabindex=\"0\">filha1</a>, se tem graveto, ou sobre a <a class=\"squiffy-link link-passage\" data-passage=\"filha2\" role=\"link\" tabindex=\"0\">filha2</a>, se não tem graveto.</p>",
		'passages': {
			'filha1': {
				'text': "<p>Fala sobre a <a class=\"squiffy-link link-passage\" data-passage=\"mãe1\" role=\"link\" tabindex=\"0\">mãe1</a>.</p>",
			},
			'mãe1': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"cresce\" role=\"link\" tabindex=\"0\">cresce</a>.</p>",
			},
			'cresce': {
				'text': "<p>Finaliza e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Interior da Casa\" role=\"link\" tabindex=\"0\">Interior da Casa</a>.</p>",
			},
			'filha2': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"mãe2\" role=\"link\" tabindex=\"0\">mãe2</a>.</p>",
			},
			'mãe2': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"passarinhos\" role=\"link\" tabindex=\"0\">passarinhos</a>.</p>",
			},
			'passarinhos': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-section\" data-section=\"Interior da Casa\" role=\"link\" tabindex=\"0\">Interior da Casa</a>.</p>",
			},
		},
	},
	'Interior da Casa': {
		'text': "<p>Inicia um dos três jogos: <a class=\"squiffy-link link-passage\" data-passage=\"jogo1\" role=\"link\" tabindex=\"0\">jogo1</a> ou <a class=\"squiffy-link link-passage\" data-passage=\"jogo2\" role=\"link\" tabindex=\"0\">jogo2</a> ou <a class=\"squiffy-link link-passage\" data-passage=\"jogo3\" role=\"link\" tabindex=\"0\">jogo3</a>.</p>",
		'passages': {
			'jogo1': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Fuligem\" role=\"link\" tabindex=\"0\">Fuligem</a>.</p>",
			},
			'Fuligem': {
				'text': "<p>Termina e vai para <a class=\"squiffy-link link-section\" data-section=\"Quintal\" role=\"link\" tabindex=\"0\">Quintal</a>.</p>",
			},
			'jogo2': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Ervilhas\" role=\"link\" tabindex=\"0\">Ervilhas</a>.</p>",
			},
			'Ervilhas': {
				'text': "<p>Termina e vai para <a class=\"squiffy-link link-section\" data-section=\"Quintal\" role=\"link\" tabindex=\"0\">Quintal</a>.</p>",
			},
			'jogo3': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Roupas Irmãs\" role=\"link\" tabindex=\"0\">Roupas Irmãs</a>.</p>",
			},
			'Roupas Irmãs': {
				'text': "<p>Termina e vai para <a class=\"squiffy-link link-section\" data-section=\"Quintal\" role=\"link\" tabindex=\"0\">Quintal</a>.</p>",
			},
		},
	},
	'Quintal': {
		'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Fada Madrinha\" role=\"link\" tabindex=\"0\">Fada Madrinha</a>.</p>",
		'passages': {
			'Fada Madrinha': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Vestido\" role=\"link\" tabindex=\"0\">Vestido</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Meia Noite\" role=\"link\" tabindex=\"0\">Meia Noite</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Carruagem\" role=\"link\" tabindex=\"0\">Carruagem</a>.</p>",
			},
			'Vestido': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Festa\" role=\"link\" tabindex=\"0\">Festa</a>.</p>",
			},
			'Meia Noite': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Festa\" role=\"link\" tabindex=\"0\">Festa</a>.</p>",
			},
			'Carruagem': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Festa\" role=\"link\" tabindex=\"0\">Festa</a>.</p>",
			},
		},
	},
	'Festa': {
		'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Dança\" role=\"link\" tabindex=\"0\">Dança</a>.</p>",
		'passages': {
			'Dança': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Príncipe\" role=\"link\" tabindex=\"0\">Príncipe</a>.</p>",
			},
			'Príncipe': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Relógio\" role=\"link\" tabindex=\"0\">Relógio</a>.</p>",
			},
			'Relógio': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Fuga\" role=\"link\" tabindex=\"0\">Fuga</a>.</p>",
			},
		},
	},
	'Fuga': {
		'text': "<p>Escolha uma fuga: <a class=\"squiffy-link link-passage\" data-passage=\"fuga1\" role=\"link\" tabindex=\"0\">fuga1</a> ou <a class=\"squiffy-link link-passage\" data-passage=\"fuga2\" role=\"link\" tabindex=\"0\">fuga2</a> ou <a class=\"squiffy-link link-passage\" data-passage=\"fuga3\" role=\"link\" tabindex=\"0\">fuga3</a>.</p>",
		'passages': {
			'Fuga1': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Casa da Árvore\" role=\"link\" tabindex=\"0\">Casa da Árvore</a>.</p>",
			},
			'Casa da Árvore': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Sapatinho\" role=\"link\" tabindex=\"0\">Sapatinho</a>.</p>",
			},
			'Fuga2': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Galinheiro\" role=\"link\" tabindex=\"0\">Galinheiro</a>.</p>",
			},
			'Galinheiro': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Sapatinho\" role=\"link\" tabindex=\"0\">Sapatinho</a>.</p>",
			},
			'Fuga3': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Pixe\" role=\"link\" tabindex=\"0\">Pixe</a>.</p>",
			},
			'Pixe': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Escadaria\" role=\"link\" tabindex=\"0\">Escadaria</a>.</p>",
			},
			'Escadaria': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Sapatinho\" role=\"link\" tabindex=\"0\">Sapatinho</a>.</p>",
			},
		},
	},
	'Sapatinho': {
		'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Encontrou\" role=\"link\" tabindex=\"0\">Encontrou</a>.</p>",
		'passages': {
			'Encontrou': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Irmã1\" role=\"link\" tabindex=\"0\">Irmã1</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Irmã2\" role=\"link\" tabindex=\"0\">Irmã2</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Borralheira\" role=\"link\" tabindex=\"0\">Borralheira</a>.</p>",
			},
			'Irmã1': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Epílogo\" role=\"link\" tabindex=\"0\">Epílogo</a>.</p>",
			},
			'Irmã2': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Epílogo\" role=\"link\" tabindex=\"0\">Epílogo</a>.</p>",
			},
			'Borralheira': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Epílogo\" role=\"link\" tabindex=\"0\">Epílogo</a>.</p>",
			},
		},
	},
	'Epílogo': {
		'text': "<p>Escolhe entre <a class=\"squiffy-link link-passage\" data-passage=\"Punicões\" role=\"link\" tabindex=\"0\">Punicões</a> e <a class=\"squiffy-link link-passage\" data-passage=\"Casamento\" role=\"link\" tabindex=\"0\">Casamento</a>.</p>",
		'passages': {
			'Punicões': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Cega\" role=\"link\" tabindex=\"0\">Cega</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Amas de Companhia\" role=\"link\" tabindex=\"0\">Amas de Companhia</a>.\nFala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Esquecimento\" role=\"link\" tabindex=\"0\">Esquecimento</a>.</p>",
			},
			'Cega': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Legendas\" role=\"link\" tabindex=\"0\">Legendas</a>.</p>",
			},
			'Amas de Companhia': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Legendas\" role=\"link\" tabindex=\"0\">Legendas</a>.</p>",
			},
			'Esquecimento': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Legendas\" role=\"link\" tabindex=\"0\">Legendas</a>.</p>",
			},
			'Casamento': {
				'text': "<p>Fala sobre <a class=\"squiffy-link link-passage\" data-passage=\"Viveram Felizes\" role=\"link\" tabindex=\"0\">Viveram Felizes</a>.</p>",
			},
			'Viveram Felizes': {
				'text': "<p>Termina e fala sobre <a class=\"squiffy-link link-section\" data-section=\"Legendas\" role=\"link\" tabindex=\"0\">Legendas</a>.</p>",
			},
		},
	},
	'Legendas': {
		'text': "<p>Sobem as legendas</p>",
		'passages': {
		},
	},
}
})();
// https://github.com/tree-sitter/tree-sitter/blob/master/docs/section-3-creating-parsers.md

if (false) {// `tree-sitter generate` fails if this is true
	// However the VSCode js extension still seems to pickup the file. Providing lovely tooltip hints :)
	require('./../../../node_modules/tree-sitter-cli/dsl');
}

module.exports = grammar({
	name: "jsontm",
	extras: $ => [
		//$._whitespace,
	],
	word: $ => $._string,
	externals: $ => [
		$._forceStringNode, // Forces a 0width empty node if it is before a double quote " . Useful when querrying the resulting syntax tree
		$.ERROR,
	],

	rules: {
		json: $ => repeat(
			choice(
				$._whitespace,
				object($,
					choice(
						$.version,
						$.schema,
						$.scopeName,
						$.name,
						$.information_for_contributors,
						$.fileTypes,
						$.firstLineMatch,
						$.foldingStartMarker,
						$.foldingStopMarker,
						$.injectionSelector,
						$.injections,
						$.patterns,
						$.repository,
						$.uuid,
						$._comments,
						$.item,
					),
				),
			),
		),

		_whitespace: $ => /\s+/,

		repository: $ => pair($,
			"repository",
			object($, $.repo),
		),
		repo: $ => pair($,
			choice(
				$._string,
				$._forceStringNode,
			),
			$._pattern,
		),
		patterns: $ => pair($,
			"patterns",
			array($,
				alias(
					$._pattern,
					$.pattern,
				),
			),
		),
		_pattern: $ => object($,
			choice(
				$.include,
				$.nameScope,
				$.contentName,
				field(
					'match',
					$.match,
				),
				field(
					'begin',
					$.begin,
				),
				$.end,
				$.while,
				field(
					'patterns',
					$.patterns,
				),
				field(
					'repository',
					$.repository,
				),
				$.captures,
				$.beginCaptures,
				$.endCaptures,
				$.whileCaptures,
				$.applyEndPatternLast,
				$._comments,
				$.item,
			),
		),

		/*
		
		source
		source#
		source#$self
		source#include
		#
		#$self
		#include
		$self
		*/
		include: $ => pair($,
			"include",
			string($,
				alias(
					choice(
						$.includeValue,
						$._forceStringNode,
					),
					$.value,
				),
			),
		),
		includeValue: $ => choice(
			$._self,
			$._base,
			$._includeScopeName,
			seq(
				optional($._includeScopeName),
				$._sharp,
				optional(
					choice(
						$._includeRuleName,
						$._self,
						$._base,
					),
				),
			),
		),
		_includeScopeName: $ => field(
			'scopeName',
			alias(
				token(
					repeat1(
						choice(
							/\\[^\r\n\t#]?/,
							/[^\\\r\n\t#"]+/,
						),
					),
				),
				$.scopeName,
			),
		),
		_sharp: $ => field(
			'sharp',
			'#',
		),
		_includeRuleName: $ => field(
			'ruleName',
			alias(
				$._string,
				$.ruleName,
			),
		),
		_self: $ => field(
			'self',
			alias(
				'$self',
				$.self,
			),
		),
		_base: $ => field(
			'base',
			alias(
				'$base',
				$.base,
			),
		),

		scopeName: $ => pair($,
			"scopeName",
			string($),
		),
		name: $ => pair($,
			"name",
			string($),
		),
		nameScope: $ => pair($,
			"name",
			string($),
		),
		contentName: $ => pair($,
			"contentName",
			string($),
		),

		injectionSelector: $ => pair($,
			"injectionSelector",
			string($),
		),
		injections: $ => pair($,
			"injections",
			object($, $.injection),
		),
		injection: $ => pair($,
			choice(
				$._string,
				$._forceStringNode,
			),
			object($,
				choice(
					$.patterns,
					$._comments,
					$.item,
				),
			),
		),

		match: $ => pair($,
			"match",
			string($,
				alias(
					choice(
						$._string,
						$._forceStringNode,
					),
					$.regex,
				),
			),
		),
		begin: $ => pair($,
			"begin",
			string($),
		),
		end: $ => pair($,
			"end",
			string($),
		),
		while: $ => pair($,
			"while",
			string($),
		),

		applyEndPatternLast: $ => pair($,
			"applyEndPatternLast",
			choice(
				$.boolean,
				$.null,
				$.integer
			),
		),

		captures: $ => pair($,
			"captures",
			object($,
				choice(
					$.capture,
					$._comments,
					$.item,
				),
			),
		),
		beginCaptures: $ => pair($,
			"beginCaptures",
			object($, $.capture),
		),
		endCaptures: $ => pair($,
			"endCaptures",
			object($, $.capture),
		),
		whileCaptures: $ => pair($,
			"whileCaptures",
			object($, $.capture),
		),
		capture: $ => pair($,
			seq(
				/\d+/,
				alias(
					repeat(
						choice(
							/\\./,
							/[^\\"\r\n]+/,
						),
					),
					'~',
				),
			),
			$._pattern,
		),

		version: $ => pair($,
			"version",
			string($),
		),
		information_for_contributors: $ => pair($,
			"information_for_contributors",
			$._value,
		),
		schema: $ => pair($,
			"$schema",
			string($),
		),
		fileTypes: $ => pair($,
			"fileTypes",
			array($, string($)),
		),
		firstLineMatch: $ => pair($,
			"firstLineMatch",
			string($),
		),
		foldingStartMarker: $ => pair($,
			"foldingStartMarker",
			string($),
		),
		foldingStopMarker: $ => pair($,
			"foldingStopMarker",
			string($),
		),
		uuid: $ => pair($,
			"uuid",
			string($),
		),

		_comments: $ => choice(
			$.comment,
			$.comment_slash,
		),
		comment: $ => pair($,
			"comment",
			string($),
		),
		comment_slash: $ => pair($,
			"//",
			$._value,
		),

		item: $ => pair($,
			choice(
				$._string,
				$._forceStringNode,
			),
			$._value,
		),
		object: $ => object($, $.item),
		array: $ => array($,
			choice(
				$.object,
				$.array,
				string($),
				$.integer,
				$.boolean,
				$.null,
			),
		),
		_value: $ => choice(
			object($, $.item),
			array($,
				choice(
					$.object,
					$.array,
					string($),
					$.integer,
					$.boolean,
					$.null,
				),
			),
			string($),
			$.integer,
			$.boolean,
			$.null,
		),

		boolean: $ => choice(
			"true",
			"false",
		),
		null: $ => "null",
		integer: $ => /\d+/,
		_string: $ => token(
			repeat1(
				choice(
					/\\[^\r\n\t]/,
					/[^\\\r\n\t"]+/,
				),
			),
		),
	},
});

/**
* Boiler plate for creating an object. `{ rule, rule... }`
* @param {_$} $ 
* @param {RuleOrLiteral} rule 
* @returns {Rule}
*/
function object($, rule) {
	return seq(
		'{',
		commaSep($, rule),
		repeat($._whitespace),
		'}',
	)
}

/**
 * Boiler plate for creating an array. `[ rule, rule... ]`
 * @param {_$} $ 
 * @param {RuleOrLiteral} rule 
 * @returns {Rule}
 */
function array($, rule) {
	return seq(
		'[',
		commaSep($, rule),
		repeat($._whitespace),
		']',
	)
}

/**
 * Boiler plate for creating comma seperated rules. `rule, rule...`
 * @param {_$} $ 
 * @param {RuleOrLiteral} rule 
 * @returns {Rule}
 */
function commaSep($, rule) {
	return optional(
		seq(
			repeat($._whitespace),
			rule,
			repeat(
				seq(
					repeat($._whitespace),
					',',
					repeat($._whitespace),
					rule,
				),
			),
		),
	)
}

/**
 * Boiler plate for creating a json pair. `key: value`
 * @param {_$} $ 
 * @param {RuleOrLiteral} key string
 * @param {RuleOrLiteral} value 
 * @returns {Rule}
 */
function pair($, key, value) {
	return seq(
		string($,
			field(
				'key',
				alias(
					key,
					$.key,
				),
			),
		),
		repeat($._whitespace),
		':',
		repeat($._whitespace),
		value,
	)
}

/**
 * Boiler plate for creating a string. `"value"`
 * @param {_$} $ 
 * @param {RuleOrLiteral | null} contents 
 * @returns {Rule}
 */
function string($, contents) {
	return seq(
		'"',
		contents != null ?
			contents :
			alias(
				choice(
					$._string,
					$._forceStringNode,
				),
				$.value,
			),
		'"',
	)
}